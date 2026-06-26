import { useState, useEffect } from 'react';
import { Search, X, Pill, Stethoscope, FileText } from 'lucide-react';

export default function ProductSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && products.length === 0) {
      const fetchProducts = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`);
          const data = await response.json();
          // Map backend fields to frontend expected fields if needed
          const mapped = data.map(p => ({
            id: p.id,
            name: p.product_name,
            category: p.category || 'General',
            summary: p.indication || 'No indication provided.',
            composition: p.composition || p.product_name + ' active ingredients',
            description: p.description || 'No detailed description available.'
          }));
          setProducts(mapped);
        } catch (error) {
          console.error('Failed to fetch products:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchProducts();
    }
  }, [isOpen]);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(query.toLowerCase()) || 
    p.category.toLowerCase().includes(query.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      <div className={`fixed right-0 top-0 bottom-0 w-full max-w-md z-50 glass-panel !rounded-none !border-y-0 !border-r-0 border-l border-white/10 flex flex-col transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Product Search</h2>
          <button onClick={onClose} className="text-secondary hover:text-white transition-colors p-2 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b border-white/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, category..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-primary placeholder:text-secondary focus:outline-none focus:border-[#22D3C7]/50 focus:bg-white/10 transition-all"
              autoFocus
            />
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {isLoading ? (
            <div className="text-center text-secondary py-8">Loading products...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-secondary py-8">No products found.</div>
          ) : filteredProducts.map((product) => (
            <div 
              key={product.id}
              onClick={() => setExpandedId(expandedId === product.id ? null : product.id)}
              className="glass-button p-4 rounded-xl cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white text-base flex items-center gap-2">
                  <Pill className="w-4 h-4 text-[#22D3C7]" />
                  {product.name}
                </h3>
                <span className="text-[10px] uppercase tracking-wider bg-white/10 px-2 py-1 rounded-full text-[#0EA5E9] font-medium border border-[#0EA5E9]/20">
                  {product.category}
                </span>
              </div>
              <p className="text-sm text-secondary line-clamp-1">{product.summary}</p>
              
              {/* Expanded Area */}
              {expandedId === product.id && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <div className="text-sm">
                    <span className="text-secondary block text-xs mb-1">Composition</span>
                    <span className="text-primary">{product.composition}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-secondary block text-xs mb-1">Dosage Guidelines</span>
                    <span className="text-primary">As prescribed by physician. Do not exceed recommended dose.</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-secondary block text-xs mb-1">Full Description</span>
                    <span className="text-primary text-xs leading-relaxed">
                      {product.description}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
