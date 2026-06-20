import React, { useState, useEffect } from "react";
import { categoryAPI } from "../../../services/apiHelpers";
import { useAuth } from "../../context/AuthContext";
import { Edit, Trash2, Plus, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add");
  const [currentCategory, setCurrentCategory] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    desc: "",
  });

  const isOwner = (category) => {
    const ownerId = category.createdBy?._id || category.createdBy;
    const myId = user?.id || user?._id;
    return ownerId && myId && ownerId.toString() === myId.toString();
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryAPI.getAll();
      setCategories(response.data.categories || []);
      setError("");
    } catch (err) {
      setError("Failed to fetch categories");
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddClick = () => {
    setDialogMode("add");
    setFormData({ name: "", desc: "" });
    setOpenDialog(true);
  };

  const handleEditClick = (category) => {
    setDialogMode("edit");
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      desc: category.desc,
    });
    setOpenDialog(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim() || !formData.desc.trim()) {
        setError("Name and description are required");
        return;
      }

      if (dialogMode === "add") {
        const response = await categoryAPI.add(formData);
        toast.success(response.data.message);
        setOpenDialog(false);
      } else {
        const response = await categoryAPI.update(
          currentCategory._id,
          formData
        );
        toast.success(response.data.message);
        setOpenDialog(false);
      }

      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
      console.error("Submit error:", err.message);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const response = await categoryAPI.delete(categoryId);
        toast.success(response.data.message);
        fetchCategories();
      } catch (err) {
        toast.error(err.message || "Cannot delete category with existing products");
      }
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCategory(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 bg-gray-50 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
            <p className="text-gray-500 mt-1">
              {categories.length} categor{categories.length !== 1 ? "ies" : "y"} total
            </p>
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={18} /> Add Category
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-500 hover:text-red-700">
              <X size={18} />
            </button>
          </div>
        )}

        {categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <h2 className="text-2xl font-semibold text-gray-700">No categories found</h2>
            <p className="text-gray-500 mt-2 mb-6">Start by adding your first category</p>
            <button
              onClick={handleAddClick}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={18} /> Add Category
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-5 text-sm font-medium text-gray-500">Name</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-gray-500">Description</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-gray-500">Products</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-gray-500">Created</th>
                    <th className="text-left py-3 px-5 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr key={category._id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">{category.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full border border-blue-200 text-blue-700 bg-blue-50">
                            {category.slug}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-sm text-gray-600 max-w-xs truncate">
                        {category.desc}
                      </td>
                      <td className="py-4 px-5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                          {category.productCount || 0}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-sm text-gray-500">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditClick(category)}
                            disabled={!isOwner(category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(category._id)}
                            disabled={category.productCount > 0 || !isOwner(category)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Add/Edit Dialog */}
        {openDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={handleCloseDialog}
            />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  {dialogMode === "add" ? "Add New Category" : "Edit Category"}
                </h2>
                <button
                  onClick={handleCloseDialog}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g., Electronics"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="desc"
                    value={formData.desc}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Describe this category..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
                  />
                </div>
                {dialogMode === "add" && (
                  <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    Slug will be auto-generated from the name (e.g., &quot;Home &amp; Kitchen&quot; → &quot;home-and-kitchen&quot;)
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCloseDialog}
                  className="px-4 py-2 text-gray-700 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!formData.name.trim() || !formData.desc.trim()}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {dialogMode === "add" ? "Add Category" : "Update Category"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
