import React, { useState, useEffect } from 'react';
import { Layers, Plus, Edit2, Trash2, Loader2, X, AlertCircle } from 'lucide-react';
import API from '../services/api.js';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await API.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
    setFormError(null);
    setIsOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setFormError(null);
    setIsOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError('Category name is required');
      return;
    }

    setActionLoading(true);
    try {
      if (editingCategory) {
        // Update Action
        const response = await API.put(`/categories/${editingCategory._id}`, formData);
        setCategories((prev) =>
          prev.map((cat) => (cat._id === editingCategory._id ? response.data : cat))
        );
      } else {
        // Create Action
        const response = await API.post('/categories', formData);
        setCategories((prev) => [...prev, response.data].sort((a, b) => a.name.localeCompare(b.name)));
      }
      setIsOpen(false);
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Action failed. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    setActionLoading(true);
    setError(null);
    try {
      await API.delete(`/categories/${id}`);
      setCategories((prev) => prev.filter((cat) => cat._id !== id));
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to delete category. Verify no products are referenced.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 w-full space-y-6 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-800 flex items-center gap-2">
            <Layers className="text-primary-500" size={24} /> Category Workspace
          </h1>
          <p className="text-sm text-slate-455 mt-1">Add, update, or remove merchandise product categories</p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-1.5 py-2.5 text-xs shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus size={15} /> New Category
        </button>
      </div>

      {/* Main Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-650 flex items-center gap-2 shadow-xs">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Categories Grid Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-primary-500" size={32} />
          <p className="text-sm text-slate-455 animate-pulse">Retrieving categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-slate-200 p-8 shadow-sm">
          <Layers className="mx-auto text-slate-300 mb-4 animate-bounce" size={44} />
          <h3 className="text-base font-bold text-slate-850">No Categories Configured</h3>
          <p className="text-xs text-slate-450 max-w-sm mx-auto mt-1 mb-6">
            Categories organize your store product listings. Add a category to get started.
          </p>
          <button onClick={openCreateModal} className="btn-primary py-2 text-xs">
            Create First Category
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 uppercase bg-slate-50">
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Slug URL</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-655">
              {categories.map((category) => (
                <tr key={category._id} className="hover:bg-slate-50/45 transition-all border-b border-slate-100">
                  <td className="py-4.5 px-6 font-bold text-slate-800">{category.name}</td>
                  <td className="py-4.5 px-6 font-mono text-xs text-primary-600">{category.slug}</td>
                  <td className="py-4.5 px-6 text-slate-500 truncate max-w-xs">{category.description || '—'}</td>
                  <td className="py-4.5 px-6 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-450 hover:bg-slate-50 hover:text-slate-850 hover:border-slate-350 transition-all cursor-pointer inline-flex shadow-sm"
                      title="Edit Category"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(category._id)}
                      className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100/70 hover:text-red-750 transition-all cursor-pointer inline-flex shadow-sm"
                      title="Delete Category"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-6 relative shadow-lg text-left">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-all cursor-pointer border border-transparent hover:border-slate-200"
            >
              <X size={16} />
            </button>

            <h2 className="text-lg font-bold mb-1 text-slate-850">
              {editingCategory ? 'Edit Category' : 'New Category'}
            </h2>
            <p className="text-xs text-slate-450 mb-6">
              {editingCategory ? 'Update details for this product grouping' : 'Add a new catalog category segment'}
            </p>

            {formError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-650">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. T-Shirts"
                  className="form-input w-full border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief summary of category products..."
                  rows="3"
                  className="form-input w-full resize-none border-slate-200"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="btn-primary w-full mt-2 flex justify-center items-center gap-1.5 shadow-md hover:shadow-lg transition-all"
              >
                {actionLoading ? <Loader2 className="animate-spin" size={14} /> : null}
                {editingCategory ? 'Save Changes' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCategories;
