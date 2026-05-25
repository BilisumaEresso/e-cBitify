import React, { useState, useEffect } from "react";
import { categoryAPI } from "../../../services/apiHelpers";
import {useAuth} from "../../context/AuthContext"
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Edit, Delete, Add, Check, Close } from "@mui/icons-material";
import toast from "react-hot-toast";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const {user}=useAuth()

  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState("add"); // 'add' or 'edit'
  const [currentCategory, setCurrentCategory] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    desc: "",
  });

  // Fetch categories
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

  // Open add dialog
  const handleAddClick = () => {
    setDialogMode("add");
    setFormData({ name: "", desc: "" });
    setOpenDialog(true);
  };

  // Open edit dialog
  const handleEditClick = (category) => {
    setDialogMode("edit");
    setCurrentCategory(category);
    setFormData({
      name: category.name,
      desc: category.desc,
    });
    setOpenDialog(true);
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form (add or update)
  const handleSubmit = async () => {
    try {
      if (!formData.name.trim() || !formData.desc.trim()) {
        setError("Name and description are required");
        return;
      }

      if (dialogMode === "add") {
        // Add new category
        const response = await categoryAPI.add(formData);
        toast.success(response.data.message)
        setOpenDialog(false);
      } else {
        // Update existing category
        const response = await categoryAPI.update(
          currentCategory._id,
          formData
        );
         toast.success(response.data.message);
        setOpenDialog(false);
      }

      fetchCategories(); // Refresh list
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
      console.error("Submit error:", err.message);
    }
  };

  // Delete category
  const handleDelete = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
      const response= await categoryAPI.delete(categoryId);
        toast.success(response.data.message);
        fetchCategories(); // Refresh list
        setTimeout(() => setSuccess(""), 3000);
      } catch (err) {
        toast.error(err.message||"Cannot delete category with existing products");
        
      }
    }
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentCategory(null);
  };

  if (loading) {
    return (
      <Container
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pt:10, mb: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Categories Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleAddClick}
          sx={{ height: "fit-content" }}
        >
          Add Category
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Categories Table */}
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Products</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category._id}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {category.name}
                    </Typography>
                    <Chip
                      label={category.slug}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {category.desc}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={category.productCount || 0}
                    color="primary"
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditClick(category)}
                      disabled={category.createdBy !== user.id} // Only allow edit if user created it
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(category._id)}
                      disabled={
                        category.productCount > 0 ||
                        category.createdBy !== user.id
                      }
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === "add" ? "Add New Category" : "Edit Category"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Electronics"
            />
            <TextField
              fullWidth
              label="Description"
              name="desc"
              value={formData.desc}
              onChange={handleInputChange}
              required
              multiline
              rows={3}
              placeholder="Describe this category..."
            />
            {dialogMode === "add" && (
              <Alert severity="info">
                Slug will be auto-generated from the name (e.g., "Home &
                Kitchen" → "home-and-kitchen")
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<Close />}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            startIcon={<Check />}
            disabled={!formData.name.trim() || !formData.desc.trim()}
          >
            {dialogMode === "add" ? "Add Category" : "Update Category"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Empty State */}
      {categories.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: "center", mt: 4 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No categories found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start by adding your first category
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddClick}
          >
            Add Category
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default CategoriesPage;
