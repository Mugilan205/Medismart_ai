import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Plus, Edit, Trash2 } from 'lucide-react';

// Clean rebuilt component with minimal 5-field form
const MedicineManagement = () => {
  const [medicines, setMedicines] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', stock: '', dosage: { form: '', strength: '' } });

  const dosageForms = ['tablet', 'capsule', 'syrup', 'ointment', 'injection'];

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const { data } = await api.get('/pharmacy/medicines');
      setMedicines(data.medicines || []);
    } catch (err) {
      console.error('Failed fetching medicines', err);
    }
  };

  const handleOpenModal = (med = null) => {
    if (med) {
      setIsEditing(true);
      setCurrentMedicine(med);
      setFormData({
        name: med.name || '',
        price: med.price || '',
        stock: med.stock || '',
        dosage: {
          form: med.dosage?.form || '',
          strength: med.dosage?.strength || '',
        },
      });
    } else {
      setIsEditing(false);
      setCurrentMedicine(null);
      setFormData({ name: '', price: '', stock: '', dosage: { form: '', strength: '' } });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentMedicine(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('dosage.')) {
      const key = name.split('.')[1];
      setFormData((prev) => ({ ...prev, dosage: { ...prev.dosage, [key]: value } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isEditing ? `/pharmacy/medicines/${currentMedicine._id}` : '/pharmacy/medicines';
    const method = isEditing ? 'put' : 'post';
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock)
      };
      await api[method](url, payload);
      fetchMedicines();
      handleCloseModal();
    } catch (err) {
      console.error('Failed saving medicine', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this medicine?')) return;
    try {
      await api.delete(`/pharmacy/medicines/${id}`);
      fetchMedicines();
    } catch (err) {
      console.error('Failed deleting medicine', err);
    }
  };

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Medicine Inventory</h1>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <Plus size={18} /> Add New
        </button>
      </div>

      {/* table */}
      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Stock</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {medicines.map((m) => (
              <tr key={m._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{m.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">${m.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{m.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <button onClick={() => handleOpenModal(m)} className="text-blue-600 mr-3">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(m._id)} className="text-red-600">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? 'Edit Medicine' : 'Add Medicine'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Name"
                  required
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Price"
                  required
                  className="p-2 border rounded"
                />
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="Stock"
                  required
                  className="p-2 border rounded"
                />
                <select
                  name="dosage.form"
                  value={formData.dosage.form}
                  onChange={handleInputChange}
                  required
                  className="p-2 border rounded"
                >
                  <option value="">Select form</option>
                  {dosageForms.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <input
                  name="dosage.strength"
                  value={formData.dosage.strength}
                  onChange={handleInputChange}
                  placeholder="Strength (e.g., 500 mg)"
                  required
                  className="p-2 border rounded"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-300 rounded"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                  {isEditing ? 'Save' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineManagement;
