import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, Eye, EyeOff, X, Loader2 } from 'lucide-react';
import axios from 'axios';

function ProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    composition: '',
    dosage: '',
    indication: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/products?admin=true`);
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        product_name: product.product_name || '',
        category: product.category || '',
        composition: product.composition || '',
        dosage: product.dosage || '',
        indication: product.indication || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ product_name: '', category: '', composition: '', dosage: '', indication: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingProduct) {
        await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${editingProduct.id}`, formData);
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, formData);
      }
      await fetchProducts();
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save product", error);
      alert("Failed to save product");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleHidden = async (id, currentHidden) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${id}`, { hidden: !currentHidden });
      setProducts(products.map(p => p.id === id ? { ...p, hidden: !currentHidden } : p));
    } catch (error) {
      console.error("Failed to toggle visibility", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
        setProducts(products.filter(p => p.id !== id));
      } catch (error) {
        console.error("Failed to delete product", error);
      }
    }
  };

  const filteredProducts = products.filter(p => 
    p.product_name?.toLowerCase().includes(search.toLowerCase()) || 
    p.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <input 
              type="text" 
              placeholder="Search Products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
          <button className="flex items-center justify-center w-10 h-10 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 shadow-sm transition-colors shrink-0" title="Category Filter">
            <Filter size={18} />
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-all shrink-0"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Product Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Composition</th>
                  <th className="px-6 py-4">Dosage</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className={`transition-colors ${p.hidden ? 'bg-gray-50/50' : 'hover:bg-blue-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${p.hidden ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                          {p.product_name}
                        </span>
                        {p.hidden && <span className="text-[10px] font-bold text-gray-400 bg-gray-200 px-2 py-0.5 rounded uppercase tracking-wider">Hidden</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${
                        p.hidden ? 'bg-gray-100 text-gray-500 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                        {p.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 max-w-[200px] truncate ${p.hidden ? 'text-gray-400' : 'text-gray-600'}`}>{p.composition}</td>
                    <td className={`px-6 py-4 ${p.hidden ? 'text-gray-400' : 'text-gray-600'}`}>{p.dosage}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button 
                        onClick={() => toggleHidden(p.id, p.hidden)}
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                          p.hidden ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-gray-50 text-gray-600 hover:bg-gray-200'
                        }`} 
                        title={p.hidden ? "Show Product" : "Hide Product"}
                      >
                        {p.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button 
                        onClick={() => handleOpenModal(p)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" 
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(p.id)}
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for Add / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name</label>
                  <input 
                    type="text" name="product_name" required
                    value={formData.product_name} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                  <input 
                    type="text" name="category" required
                    value={formData.category} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Composition</label>
                  <textarea 
                    name="composition" rows="2"
                    value={formData.composition} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dosage</label>
                  <input 
                    type="text" name="dosage"
                    value={formData.dosage} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Indication</label>
                  <textarea 
                    name="indication" rows="2"
                    value={formData.indication} onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  ></textarea>
                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button 
                type="button" 
                onClick={handleCloseModal}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="productForm"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-70"
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                {editingProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductsList;
