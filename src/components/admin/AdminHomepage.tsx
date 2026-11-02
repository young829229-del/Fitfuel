import { useState, useEffect } from 'react';
import { useProducts } from '../../context/ProductContext';
import { HomepageSettings } from '../../types/store';
import { Sliders, Check, AlertCircle, Save, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminHomepage() {
  const { products, homepageSettings, saveHomepageSettings } = useProducts();

  const [settings, setSettings] = useState<HomepageSettings>({
    featuredProductIds: [],
    bestSellerIds: [],
    newArrivalIds: [],
    recommendedIds: []
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (homepageSettings) {
      setSettings(homepageSettings);
    } else if (products.length > 0) {
      const allIds = products.map(p => p.id);
      setSettings({
        featuredProductIds: allIds.slice(0, 3),
        bestSellerIds: allIds.slice(1, 4),
        newArrivalIds: allIds.slice(0, 2),
        recommendedIds: allIds.slice(2, 5)
      });
    }
  }, [homepageSettings, products]);

  const toggleProduct = (section: keyof Omit<HomepageSettings, 'updatedAt'>, id: string) => {
    setSettings(prev => {
      const currentList = prev[section] || [];
      const updated = currentList.includes(id)
        ? currentList.filter(itemId => itemId !== id)
        : [...currentList, id];
      return { ...prev, [section]: updated };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      await saveHomepageSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to save homepage settings.");
    } finally {
      setSaving(false);
    }
  };

  const sections: { key: keyof Omit<HomepageSettings, 'updatedAt'>; title: string; desc: string }[] = [
    { key: 'featuredProductIds', title: 'Featured Products', desc: 'Prominently highlighted products for hero showcases' },
    { key: 'bestSellerIds', title: 'Best Sellers', desc: 'Top trending supplements with proven customer demand' },
    { key: 'newArrivalIds', title: 'New Arrivals', desc: 'Latest formulation additions to the FitFul catalog' },
    { key: 'recommendedIds', title: 'Recommended Supplements', desc: 'Curated nutritionist and fitness recommendations' }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-950 tracking-tight">Homepage Section Management</h1>
          <p className="text-sm text-gray-500 mt-1">Curate and organize product collections displayed on the storefront.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700"
          >
            Live Preview <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
          </Link>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-neutral-800 text-white text-sm font-bold rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Publish Layout'}
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-green-600 shrink-0" />
          <span>Homepage layout published! Live storefront updated automatically.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sections Configuration */}
      <div className="space-y-6">
        {sections.map(section => {
          const selectedCount = settings[section.key]?.length || 0;

          return (
            <div key={section.key} className="bg-white rounded-3xl border border-gray-100 p-6 md:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                <div>
                  <h3 className="text-lg font-black text-gray-900">{section.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{section.desc}</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
                  {selectedCount} selected
                </span>
              </div>

              {/* Product Checkbox Selection Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
                {products.map(product => {
                  const isSelected = settings[section.key]?.includes(product.id);
                  const displayImg = (product.images && product.images[0]) || product.image || '/public/assets/aistudio/IMG_e9755086-1600-4fc3-b90a-e97667f39591_5ab03a1e.jpg';

                  return (
                    <div
                      key={product.id}
                      onClick={() => toggleProduct(section.key, product.id)}
                      className={`p-3 rounded-2xl border-2 transition cursor-pointer flex items-center gap-3 select-none ${
                        isSelected 
                          ? 'border-black bg-neutral-50 shadow-sm' 
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={displayImg}
                        alt={product.name}
                        className="w-12 h-12 object-contain bg-gray-50 rounded-lg p-1 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-gray-900 truncate">{product.name}</div>
                        <div className="text-[11px] text-gray-500">${product.price.toFixed(2)}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-black border-black text-white' : 'border-gray-300 bg-white'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
