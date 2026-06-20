import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { categoryAPI, productAPI } from "../../../services/apiHelpers";
import {
  Plus,
  Sparkles,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import generateProductDetails from "../../../services/aiGenerate";

const AddProduct = () => {
  const { id: editId } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(editId);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [currentProductId, setCurrentProductId] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState([]); // Stores photo objects with _id, signedUrl, etc.
  const [selectedFiles, setSelectedFiles] = useState([]); // Stores File objects before upload
  const [imageUploadProgress, setImageUploadProgress] = useState({});

  const fileInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    price: 0,
    category: "",
    quantity: 0,
  });

  const [aiPrompt, setAiPrompt] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryAPI.getAll();
      setCategories(response.data.categories || []);
    } catch (err) {
      toast.error("Failed to fetch categories");
      console.error("Fetch error:", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    const loadExistingProduct = async () => {
      try {
        setPageLoading(true);
        const res = await productAPI.getById(editId);
        const product = res.data.product;
        setFormData({
          name: product.name || "",
          desc: product.desc || "",
          price: product.price || 0,
          category: product.category?._id || product.category || "",
          quantity: product.quantity || 0,
        });
        setUploadedPhotos(product.photo || []);
        setCurrentProductId(editId);
        setShowImageUpload(true);
      } catch {
        toast.error("Failed to load product for editing");
      } finally {
        setPageLoading(false);
      }
    };
    loadExistingProduct();
  }, [editId, isEditMode]);

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Generate product name and description using AI
  const generateWithAI = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a product description");
      return;
    }

    try {
      setAiGenerating(true);
      const result = await generateProductDetails(aiPrompt);

      if (result.success && result.data) {
        setFormData((prev) => ({
          ...prev,
          name: result.data.name || "",
          desc: result.data.description || "",
          price: result.data.suggestedPrice || "",
        }));
        toast.success("AI generated content successfully!");
      } else if (result.fallback) {
        setFormData((prev) => ({
          ...prev,
          name: result.fallback.name || "",
          desc: result.fallback.description || "",
          price: result.fallback.suggestedPrice || "",
        }));
        toast.success("Generated with fallback AI!");
      }
    } catch (err) {
      toast.error("AI generation failed");
      console.error("AI error:", err);
    } finally {
      setAiGenerating(false);
    }
  };

  // Submit product form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Validation
      if (
        !formData.name.trim() ||
        !formData.desc.trim() ||
        !formData.price ||
        !formData.category ||
        !formData.quantity
      ) {
        toast.error("All fields are required");
        setLoading(false);
        return;
      }

      const productData = {
        name: formData.name.trim(),
        desc: formData.desc.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        quantity: parseInt(formData.quantity),
      };

      if (isEditMode) {
        await productAPI.update(editId, productData);
        toast.success("Product updated successfully!");
        navigate("/seller/products");
      } else {
        const response = await productAPI.add(productData);
        const product = response.data.product;
        setCurrentProductId(product._id);
        toast.success("Product added! Now add images.");
        setShowImageUpload(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add product");
      console.error("Submit error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);

    // Validate total count (selected + already uploaded)
    if (selectedFiles.length + uploadedPhotos.length + files.length > 6) {
      toast.error("Maximum 6 images allowed");
      return;
    }

    // Validate file types and size
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      // Add preview URLs for selected files
      const newFilesWithPreview = validFiles.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
        id: `temp-${Date.now()}-${Math.random()}`, // Temporary ID
        status: "pending", // pending, uploading, uploaded, error
      }));

      setSelectedFiles((prev) => [...prev, ...newFilesWithPreview]);
    }
  };

  // Upload selected images
  const uploadSelectedImages = async () => {
    if (!currentProductId) {
      toast.error("No product info added");
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error("No image to upload");
      return;
    }
    setUploadingImages(true);

    try {
      const formData = new FormData();

      // Add all files to formData with field name "images" (matches backend)
      selectedFiles.forEach((fileObj, index) => {
        formData.append("images", fileObj.file);
      });

      // Update status to uploading
      setSelectedFiles((prev) =>
        prev.map((file) =>
          file.status === "pending" ? { ...file, status: "uploading" } : file
        )
      );

      // Call backend route: POST /products/:id/images
      const response = await productAPI.uploadImages(
        currentProductId,
        formData
      );

      // Response should contain array of photo objects
      const uploadedPhotoObjects = response.data.photos || [];

      // Add uploaded photos to state
      setUploadedPhotos((prev) => [...prev, ...uploadedPhotoObjects]);

      // Clear selected files
      setSelectedFiles((prev) =>
        prev.filter((file) => file.status !== "uploading")
      );

      toast.success(
        `Successfully uploaded ${uploadedPhotoObjects.length} image(s)!`
      );
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload images");

      // Update status to error for failed uploads
      setSelectedFiles((prev) =>
        prev.map((file) => ({ ...file, status: "error" }))
      );
    } finally {
      setUploadingImages(false);
    }
  };

  // Remove selected file (before upload)
  const removeSelectedFile = (fileId) => {
    setSelectedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove && fileToRemove.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  // Remove uploaded photo
  const removeUploadedPhoto = async (photoId) => {
    try {
      // Call backend to delete photo
      await productAPI.deletePhoto(currentProductId, photoId);

      // Remove from state
      setUploadedPhotos((prev) =>
        prev.filter((photo) => photo._id !== photoId)
      );

      toast.success("Image removed");
    } catch (error) {
      toast.error("Failed to remove image");
      console.error("Remove error:", error);
    }
  };

  // Retry failed uploads
  const retryFailedUploads = () => {
    const hasFailed = selectedFiles.some((f) => f.status === "error");

    if (!hasFailed) {
      toast.error("No failed uploads to retry");
      return;
    }

    setSelectedFiles((prev) =>
      prev.map((file) =>
        file.status === "error" ? { ...file, status: "pending" } : file
      )
    );
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      desc: "",
      price: 0,
      category: "",
      quantity: 0,
    });
    setAiPrompt("");

    // Clean up object URLs
    selectedFiles.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });

    setSelectedFiles([]);
    setUploadedPhotos([]);
    setCurrentProductId(null);
    setShowImageUpload(false);
    setImageUploadProgress({});
  };

  // Finish and close
  const handleFinish = () => {
    if (selectedFiles.length > 0) {
      toast("You have unsaved images. Upload them first or they will be lost.");
      return;
    }
    toast.success(isEditMode ? "Product updated successfully!" : "Product created successfully!");
    resetForm();
    navigate("/seller/products");
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!showImageUpload || !currentProductId) {
      toast.error("Please create the product first");
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageSelect({ target: { files } });
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Plus className="w-7 h-7" />
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEditMode ? "Update your product details and images" : "Fill in the details to add a new product to your store"}
          </p>
        </div>

        {/* AI Generation Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">
              Generate with AI
            </h3>
          </div>

          <div className="space-y-3">
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe your product in simple words (e.g., 'a comfortable cotton t-shirt for summer')"
              rows="3"
              className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
            />

            <button
              onClick={generateWithAI}
              disabled={aiGenerating || !aiPrompt.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5"
            >
              {aiGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Name & Description
                </>
              )}
            </button>
          </div>

          <p className="mt-3 text-sm text-blue-700">
            AI will generate product name and description based on your input
          </p>
        </div>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-gray-50 text-gray-500">OR</span>
          </div>
        </div>

        {/* Product Form - Hide when showing image upload */}
        {!showImageUpload ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Football 2012 Edition"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="e.g., 16"
                  min="0"
                  step="0.01"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="e.g., 250"
                  min="1"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  disabled={loadingCategories}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {loadingCategories && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Loading categories...
                  </div>
                )}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="desc"
                value={formData.desc}
                onChange={handleInputChange}
                placeholder="e.g., High-grade leather football for training. Perfect for professional matches and practice sessions."
                rows="4"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
              />
            </div>

            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Clear All
              </button>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Adding Product...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Image Upload Section */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ImageIcon className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Add Product Images
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Product created! Add images to make it visible
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {uploadedPhotos.length}/6 photos
              </div>
            </div>

            {/* Upload Area */}
            <div className="mb-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                multiple
                accept="image/*"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 transition-colors bg-gray-50"
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">
                  Click to upload or drag & drop images
                </p>
                <p className="text-sm text-gray-500">
                  Supports JPG, PNG, WEBP • Max 5MB each • Max 6 photos total
                </p>
              </div>
            </div>

            {/* Selected Files (Pending Upload) */}
            {selectedFiles.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Selected Images ({selectedFiles.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                  {selectedFiles.map((file) => (
                    <div key={file.id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                        {file.status === "error" && (
                          <div className="absolute inset-0 bg-red-50/80 flex items-center justify-center">
                            <span className="text-red-600 text-xs font-medium">
                              Failed
                            </span>
                          </div>
                        )}
                        {file.status === "uploading" && (
                          <div className="absolute inset-0 bg-blue-50/80 flex items-center justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeSelectedFile(file.id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="mt-1 text-xs text-gray-500 truncate">
                        {file.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  ))}
                </div>

                {/* Upload Selected Button */}
                <div className="flex justify-end">
                  <button
                    onClick={uploadSelectedImages}
                    disabled={uploadingImages || selectedFiles.length === 0}
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    {uploadingImages ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Selected ({selectedFiles.length})
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Uploaded Photos Grid */}
            {uploadedPhotos.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-700 mb-4">
                  Uploaded Photos ({uploadedPhotos.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {uploadedPhotos.map((photo) => (
                    <div key={photo._id} className="relative group">
                      <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
                        <img
                          src={photo.signedUrl || photo.url}
                          alt={photo.name || `Product photo`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removeUploadedPhoto(photo._id)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        title="Remove"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {photo.name && (
                        <div className="mt-1 text-xs text-gray-500 truncate">
                          {photo.name}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowImageUpload(false)}
                className="px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← Back to Edit Product
              </button>

              <div className="flex items-center gap-4">
                {selectedFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={retryFailedUploads}
                    className="px-4 py-2 text-red-600 font-medium border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Retry Failed
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleFinish}
                  disabled={selectedFiles.length > 0}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  Finish
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> Photos are stored separately and linked
                to the product. First photo will be used as the main product
                image in listings.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddProduct;
