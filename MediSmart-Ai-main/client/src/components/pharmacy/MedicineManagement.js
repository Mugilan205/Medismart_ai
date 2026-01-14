import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Edit, Trash2 } from 'lucide-react';

const MedicineManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState(null);
  const [formData, setFormData] = useState({});

  // Categories removed; not needed for minimal form

  const dosageForms = ['tablet', 'capsule', 'syrup'];

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
            const { data } = await api.get('/pharmacy/medicines');
      setMedicines(data.medicines || []);
    } catch (error) {
      console.error('Failed to fetch medicines:', error);
    }
  };

  const resetFormData = () => {
    return {
      name: '', price: '', stock: '', dosage: { form: '', strength: '' }
    };
  };

  const handleOpenModal = (medicine = null) => {
    if (medicine) {
      setIsEditing(true);
      setCurrentMedicine(medicine);
      setFormData({
        ...medicine,
        expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate).toISOString().split('T')[0] : '',
        dosage: medicine.dosage || { form: '', strength: '', instructions: '' }
      });
    } else {
      setIsEditing(false);
      setCurrentMedicine(null);
      setFormData(resetFormData());
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMedicine(null);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    if (name.startsWith('dosage.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({ ...prev, dosage: { ...prev.dosage, [field]: val } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing ? `/pharmacy/medicines/${currentMedicine._id}` : '/pharmacy/medicines';
    const method = isEditing ? 'put' : 'post';

    try {
            await api[method](url, formData);
      fetchMedicines();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save medicine:', error.response ? error.response.data : error.message);
      // You can add a state to show error messages in the UI here
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
                await api.delete(`/pharmacy/medicines/${id}`);
        fetchMedicines();
      } catch (error) {
        console.error('Failed to delete medicine:', error);
      }
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Medicine Inventory</h1>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 flex items-center gap-2 transition-colors">
          <Plus size={20} />
          Add New Medicine
        </button>
      </div>

      {/* Medicine List Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Brand</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {medicines.map(med => (
              <tr key={med._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{med.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.brand}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{med.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">${med.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{med.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
                  <button onClick={() => handleOpenModal(med)} className="text-blue-600 hover:text-blue-900 mr-4"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(med._id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Medicine' : 'Add New Medicine'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Minimal Form Fields */}
                <input type="text" name="name" name || ''} onChange={handleInputChange} placeholder="Name" required className="p-2 border rounded" />
                 brand || ''} onChange={handleInputChange} placeholder="Brand" required className="p-2 border rounded" />
                 category || ''} onChange={handleInputChange} required className="p-2 border rounded">
                  <option value="" disabled>Select Category</option>
                  
                </select>
                 description || ''} onChange={handleInputChange} placeholder="Description" className="p-2 border rounded md:col-span-2" />
                <input type="number" name="price" price || ''} onChange={handleInputChange} placeholder="Price" required className="p-2 border rounded" />
                <input type="number" name="stock" stock || ''} onChange={handleInputChange} placeholder="Stock" required className="p-2 border rounded" />
                 composition || ''} onChange={handleInputChange} placeholder="Composition" className="p-2 border rounded" />
                 sideEffects || ''} onChange={handleInputChange} placeholder="Side Effects" className="p-2 border rounded" />
                
                }
                
                <select name="dosage.form" dosage?.form || ''} onChange={handleInputChange} required className="p-2 border rounded">
                  <option value="" disabled>Select Form</option>
                  {dosageForms.map(form => <option key={form} value={form}>{form}</option>)}
                </select>
                <input type="text" name="dosage.strength" dosage?.strength || ''} onChange={handleInputChange} placeholder="Strength (e.g., 500mg)" required className="p-2 border rounded" />
                 dosage.instructions || ''} onChange={handleInputChange} placeholder="Instructions" required className="p-2 border rounded md:col-span-2" />

                
                 expiryDate || ''} onChange={handleInputChange} className="p-2 border rounded" />
                 batchNumber || ''} onChange={handleInputChange} placeholder="Batch Number" className="p-2 border rounded" />
                
                  <input type="checkbox" id="isPrescriptionRequired" name="isPrescriptionRequired" checked={formData.isPrescriptionRequired || false} onChange={handleInputChange} className="h-4 w-4" />
                  <label htmlFor="isPrescriptionRequired">Prescription Required?</label>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button type="button" onClick={handleCloseModal} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{isEditing ? 'Save Changes' : 'Add Medicine'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineManagement;
