import React, { useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { Banner } from '../../types/store';
import { compressImageFile } from '../../utils/imageCompressor';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function AdminBanners() {
  const { banners, saveBanner, removeBanner } = useProducts();
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenNew = () => {
    setEditingBanner({
      title: '',
      subtitle: '',
      description: '',
      buttonText: 'Shop Collection',
      buttonLink: '/',
      image: '',
      isActive: true,
      order: (banners.length || 0) + 1
    });
    setIsModalOpen(true);
    setError(null);
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner({ ...banner });
    setIsModalOpen(true);
    setError(null);
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Delete banner "${title}"?`)) {
      try {
        await removeBanner(id);
      } catch (err: any) {
        setError(err.message || 'Failed to delete banner.');
      }
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    try {
      await saveBanner({ ...banner, isActive: !banner.isActive }, banner.id);
    } catch (err: any) {
      setError(err.message || 'Failed to toggle banner status.');
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const base64 = await compressImageFile(file, 1200, 500, 0.85);
      setEditingBanner(prev => prev ? { ...prev, image: base64 } : null);
    } catch (err) {
      setError("Failed to process banner image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBanner?.title?.trim()) {
      setError("Banner title is required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await saveBanner(editingBanner, editingBanner.id);
      setIsModalOpen(false);
      setEditingBanner(null);
    } catch (err: any) {
      setError(err.message || 'Failed to save banner.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-950 tracking-tight">Banner Management</h1>
          <p className="text-sm text-gray-500 mt-1">Configure active promotional announcements and hero campaigns.</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-neutral-800 text-white text-sm font-semibold rounded-xl shadow-sm transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create New Banner
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((b, index) => (
          <div
            key={b.id}
            className={`bg-white rounded-3xl border-2 p-6 transition flex flex-col justify-between ${
              b.isActive ? 'border-gray-200 shadow-sm' : 'border-dashed border-gray-200 opacity-60'
            }`}
          >
            <div>
              {/* Status Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <span className="text-xs font-mono font-bold text-gray-400">#0{index + 1} Priority</span>
                <button
                  onClick={() => handleToggleActive(b)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                    b.isActive 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                >
                  {b.isActive ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {b.isActive ? 'Active on Store' : 'Disabled'}
                </button>
              </div>

              {/* Preview Visual Container */}
              <div className="mt-4 rounded-2xl overflow-hidden bg-neutral-900 text-white p-5 relative min-h-[120px] flex flex-col justify-center">
                {b.image && (
                  <img
                    src={b.image}
                    alt={b.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-30 pointer-events-none"
                  />
                )}
                <div className="relative z-10">
                  {b.subtitle && <p className="text-xs font-bold tracking-widest text-yellow-400 uppercase mb-1">{b.subtitle}</p>}
                  <h3 className="text-lg font-black leading-tight text-white">{b.title}</h3>
                  {b.description && <p className="text-xs text-neutral-300 mt-2 line-clamp-2">{b.description}</p>}
                  {b.buttonText && (
                    <span className="inline-block mt-3 px-3 py-1 bg-white text-black font-bold text-[11px] rounded-lg">
                      {b.buttonText} &rarr;
                    </span>
                  )}
                </div>
              </div>

              {b.buttonLink && (
                <div className="mt-3 text-xs text-gray-400 font-mono">
                  Destination: <span className="text-gray-600">{b.buttonLink}</span>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                onClick={() => handleEdit(b)}
                className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" /> Edit
              </button>
              <button
                onClick={() => handleDelete(b.id, b.title)}
                className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Banner Modal */}
      {isModalOpen && editingBanner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-black text-gray-950 mb-6">
              {editingBanner.id ? 'Edit Promotional Banner' : 'Create Store Banner'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Banner Title *</label>
                <input
                  type="text"
                  placeholder="e.g. FLASH SALE: 20% OFF ALL PROTEIN POWDERS"
                  value={editingBanner.title || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Subtitle / Badge</label>
                <input
                  type="text"
                  placeholder="e.g. LIMITED TIME OFFER"
                  value={editingBanner.subtitle || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, subtitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional context or code, e.g. Use code FITFUL20 at checkout"
                  value={editingBanner.description || ''}
                  onChange={(e) => setEditingBanner({ ...editingBanner, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Button Text</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Now"
                    value={editingBanner.buttonText || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, buttonText: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Button Link</label>
                  <input
                    type="text"
                    placeholder="e.g. /"
                    value={editingBanner.buttonLink || ''}
                    onChange={(e) => setEditingBanner({ ...editingBanner, buttonLink: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
                  />
                </div>
              </div>

              {/* Banner Background Image */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">Banner Background Image</label>
                <div className="flex items-center gap-3">
                  <label className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" /> Upload Image
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {uploading && <span className="text-xs text-gray-500">Processing image...</span>}
                  {editingBanner.image && (
                    <button
                      type="button"
                      onClick={() => setEditingBanner({ ...editingBanner, image: '' })}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Remove Image
                    </button>
                  )}
                </div>
                {editingBanner.image && (
                  <div className="mt-2 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                    <img src={editingBanner.image} alt="Banner preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingBanner.isActive}
                    onChange={(e) => setEditingBanner({ ...editingBanner, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-black focus:ring-black accent-black"
                  />
                  <span className="text-sm font-semibold text-gray-800">Publish immediately to live storefront</span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-sm font-bold transition shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
