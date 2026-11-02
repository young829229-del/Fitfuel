import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductContext';
import { Product } from '../../types/store';
import { compressImageFile } from '../../utils/imageCompressor';
import { 
  ArrowLeft, 
  Upload, 
  X, 
  Star, 
  ArrowLeftRight, 
  Check, 
  AlertCircle,
  Plus,
  Eye,
  Trash2
} from 'lucide-react';

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, saveProduct } = useProducts();

  const isEditing = Boolean(id);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [discountPrice, setDiscountPrice] = useState<number | string>('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState<number | string>(20);
  const [category, setCategory] = useState('Supplements');
  const [weightSize, setWeightSize] = useState('500g');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isUnavailable, setIsUnavailable] = useState(false);

  // Specifications
  const [keyBenefits, setKeyBenefits] = useState<string[]>(['100% Authentic Quality']);
  const [benefitInput, setBenefitInput] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [nutritionalInfo, setNutritionalInfo] = useState('');
  const [usage, setUsage] = useState('');

  // Images state (Array of Base64 or Asset URLs)
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  // UI status
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Load existing product if editing
  useEffect(() => {
    if (id && products.length > 0) {
      const existing = products.find(p => p.id === id);
      if (existing) {
        setName(existing.name || '');
        setSlug(existing.slug || '');
        setPrice(existing.price || '');
        setDiscountPrice(existing.discountPrice || '');
        setDescription(existing.description || '');
        setStock(existing.stock !== undefined ? existing.stock : 20);
        setCategory(existing.category || 'Supplements');
        setWeightSize(existing.weightSize || '500g');
        setIsFeatured(!!existing.isFeatured);
        setIsUnavailable(!!existing.isUnavailable);
        setKeyBenefits(existing.keyBenefits && existing.keyBenefits.length > 0 ? existing.keyBenefits : ['High Protein']);
        setIngredients(existing.ingredients || '');
        setNutritionalInfo(existing.nutritionalInfo || '');
        setUsage(existing.usage || '');
        
        const existingImages = existing.images && existing.images.length > 0 
          ? existing.images 
          : [existing.image || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg'];
        setImages(existingImages);
      }
    }
  }, [id, products]);

  // Auto-generate slug from name if adding
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  // Add Key Benefit
  const handleAddBenefit = () => {
    if (benefitInput.trim()) {
      setKeyBenefits([...keyBenefits, benefitInput.trim()]);
      setBenefitInput('');
    }
  };

  const handleRemoveBenefit = (index: number) => {
    setKeyBenefits(keyBenefits.filter((_, i) => i !== index));
  };

  // Image Upload handler directly from user device
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setErrorMessage(null);

    try {
      const newImagesList: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Compress image to ensure it stays high quality and within Firestore doc size limit
        const base64 = await compressImageFile(file, 900, 900, 0.85);
        newImagesList.push(base64);
      }
      setImages(prev => [...prev, ...newImagesList]);
    } catch (err: any) {
      console.error("Image processing error:", err);
      setErrorMessage("Failed to process uploaded image. Please try again.");
    } finally {
      setUploadingImage(false);
      // Reset input value so same file can be re-uploaded if desired
      e.target.value = '';
    }
  };

  // Image deletion
  const handleDeleteImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Set as Primary Image (move to index 0)
  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const selected = images[index];
    const remaining = images.filter((_, i) => i !== index);
    setImages([selected, ...remaining]);
  };

  // Reorder Image
  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const copy = [...images];
    const [moved] = copy.splice(from, 1);
    copy.splice(to, 0, moved);
    setImages(copy);
  };

  // Preset library photos quick picker
  const presetPhotos = [
    { label: 'Pintola Oats', url: '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg' },
    { label: 'Wellcore Creatine', url: '/public/assets/aistudio/images__2__3076b8c4.jpeg' },
    { label: 'Kulfi Peanut Butter', url: '/public/assets/aistudio/61Z6RwyreWL_1a612f23.jpg' },
    { label: 'Cookie Peanut Butter', url: '/public/assets/aistudio/images__3__689e8f19.jpeg' },
    { label: 'Mango Chia PB', url: '/public/assets/aistudio/images__4__877d71a7.jpeg' }
  ];

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrorMessage("Please enter a product name.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setErrorMessage("Please enter a valid product price.");
      return;
    }
    if (!slug.trim()) {
      setErrorMessage("Please provide a URL slug.");
      return;
    }

    setSaving(true);

    const productPayload: Partial<Product> = {
      name: name.trim(),
      slug: slug.trim().toLowerCase(),
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      description: description.trim(),
      stock: Number(stock) >= 0 ? Number(stock) : 0,
      category,
      weightSize,
      isFeatured,
      isUnavailable,
      keyBenefits,
      ingredients,
      nutritionalInfo,
      usage,
      images: images.length > 0 ? images : ['/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg'],
      image: images[0] || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg'
    };

    try {
      await saveProduct(productPayload, id);
      setSuccessMessage("Product saved successfully! Storefront synchronized.");
      setTimeout(() => {
        navigate('/admin/products');
      }, 700);
    } catch (err: any) {
      console.error("Save product error:", err);
      setErrorMessage(err.message || "Failed to save product to database.");
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <Link
          to="/admin/products"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-black transition font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>
        <span className="text-xs uppercase tracking-widest text-gray-400 font-bold">
          {isEditing ? 'Editing Product' : 'New Product Registration'}
        </span>
      </div>

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-2xl flex items-center gap-3">
          <Check className="w-5 h-5 shrink-0 text-green-600" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">Basic Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Product Name *</label>
              <input
                type="text"
                placeholder="e.g. Wellcore Creatine Monohydrate"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">URL Slug *</label>
              <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-gray-50 text-sm">
                <span className="px-3 py-3 text-gray-400 bg-gray-100 border-r border-gray-200 text-xs font-mono select-none">/product/</span>
                <input
                  type="text"
                  placeholder="wellcore-creatine-monohydrate"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-3 bg-gray-50 focus:outline-none focus:bg-white font-mono text-xs"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Regular Price ($) *</label>
              <input
                type="number"
                step="0.01"
                placeholder="24.99"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white font-bold"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Discount / Sale Price ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="Optional sale price"
                value={discountPrice}
                onChange={(e) => setDiscountPrice(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white font-bold text-green-700"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Stock Quantity *</label>
              <input
                type="number"
                min="0"
                placeholder="25"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white font-bold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Category</label>
              <input
                type="text"
                placeholder="e.g. Protein, Creatine, Peanut Butter"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Size / Net Weight</label>
              <input
                type="text"
                placeholder="e.g. 1 kg / 100g / 250g"
                value={weightSize}
                onChange={(e) => setWeightSize(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Product Description</label>
            <textarea
              rows={4}
              placeholder="Detailed product story, nutritional benefits, and details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
            />
          </div>
        </div>

        {/* Section 2: Product Image Management */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-lg font-black text-gray-900">Product Images & Gallery</h2>
              <p className="text-xs text-gray-500">Upload multiple images directly from your device. The first image is the Primary / Carousel cover.</p>
            </div>
            <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition shadow-sm">
              <Upload className="w-3.5 h-3.5" /> Upload from Device
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploadingImage}
              />
            </label>
          </div>

          {/* Quick Preset Library Picker */}
          <div>
            <span className="text-xs text-gray-400 font-medium block mb-2">Or choose from uploaded store assets:</span>
            <div className="flex flex-wrap gap-2">
              {presetPhotos.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImages(prev => [...prev, preset.url])}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-lg transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Previews Grid */}
          {images.length === 0 ? (
            <div className="p-12 border-2 border-dashed border-gray-200 rounded-2xl text-center">
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600">No images added yet.</p>
              <p className="text-xs text-gray-400 mt-1">Upload a photo from your computer/phone or select a preset above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img, index) => {
                const isPrimary = index === 0;

                return (
                  <div
                    key={index}
                    className={`relative group bg-gray-50 border-2 rounded-2xl p-2 flex flex-col items-center justify-center h-44 overflow-hidden transition ${
                      isPrimary ? 'border-black shadow-md' : 'border-gray-200'
                    }`}
                  >
                    {isPrimary && (
                      <span className="absolute top-2 left-2 z-10 px-2 py-0.5 bg-black text-white text-[10px] font-bold uppercase rounded-md tracking-wider flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-white" /> Primary
                      </span>
                    )}

                    <img
                      src={img}
                      alt={`Product preview ${index + 1}`}
                      className="w-full h-28 object-contain"
                    />

                    {/* Image Controls Toolbar */}
                    <div className="mt-2 w-full flex items-center justify-between gap-1 pt-2 border-t border-gray-200 text-xs">
                      {!isPrimary && (
                        <button
                          type="button"
                          onClick={() => handleSetPrimary(index)}
                          className="text-[11px] font-semibold text-gray-600 hover:text-black"
                          title="Make Primary Cover"
                        >
                          Make Primary
                        </button>
                      )}

                      <div className="flex items-center gap-1 ml-auto">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveImage(index, index - 1)}
                            className="p-1 text-gray-400 hover:text-black"
                            title="Move left"
                          >
                            &larr;
                          </button>
                        )}
                        {index < images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => handleMoveImage(index, index + 1)}
                            className="p-1 text-gray-400 hover:text-black"
                            title="Move right"
                          >
                            &rarr;
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 3: Nutritional Info & Usage Specifications */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3">Key Benefits & Specifications</h2>

          {/* Key Benefits List */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Key Benefits</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. 26g High Protein per serving"
                value={benefitInput}
                onChange={(e) => setBenefitInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBenefit(); } }}
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:bg-white"
              />
              <button
                type="button"
                onClick={handleAddBenefit}
                className="px-4 py-2.5 bg-neutral-800 hover:bg-black text-white text-xs font-bold uppercase rounded-xl transition"
              >
                Add Benefit
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {keyBenefits.map((benefit, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-800 text-xs font-semibold rounded-lg"
                >
                  <Check className="w-3 h-3 text-green-600" /> {benefit}
                  <button
                    type="button"
                    onClick={() => handleRemoveBenefit(idx)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Nutritional Information</label>
              <textarea
                rows={3}
                placeholder="e.g. Per 100g: 380 kcal, 26g Protein, 5g Fiber"
                value={nutritionalInfo}
                onChange={(e) => setNutritionalInfo(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">Ingredients</label>
              <textarea
                rows={3}
                placeholder="e.g. Rolled Oats, Whey Protein, Cocoa"
                value={ingredients}
                onChange={(e) => setIngredients(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">How to Use / Directions</label>
              <textarea
                rows={3}
                placeholder="e.g. Mix 50g with water or milk, cook for 3 min"
                value={usage}
                onChange={(e) => setUsage(e.target.value)}
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:bg-white"
              />
            </div>
          </div>

          {/* Visibility and Featured Toggles */}
          <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded text-black focus:ring-black accent-black"
              />
              <span className="text-sm font-semibold text-gray-800">Feature on Homepage Carousel & Showcase</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isUnavailable}
                onChange={(e) => setIsUnavailable(e.target.checked)}
                className="w-4 h-4 rounded text-red-600 focus:ring-red-600 accent-red-600"
              />
              <span className="text-sm font-semibold text-gray-800">Hide from Storefront (Mark Unavailable)</span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <Link
            to="/admin/products"
            className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold text-sm rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || uploadingImage}
            className="px-8 py-3 bg-black hover:bg-neutral-800 text-white font-bold text-sm rounded-xl transition shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
          >
            {saving ? 'Saving to Database...' : isEditing ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
