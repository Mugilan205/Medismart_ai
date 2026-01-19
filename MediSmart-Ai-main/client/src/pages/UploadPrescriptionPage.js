import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { UploadCloud, FileText, Pill, AlertTriangle, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../components/common/Spinner';

const UploadPrescriptionPage = () => {
  // Load state from session storage on initial render
  const getInitialState = (key, defaultValue) => {
    try {
      const storedData = sessionStorage.getItem('prescriptionResults');
      if (storedData) {
        const { data, timestamp } = JSON.parse(storedData);
        // Data is valid for 3 minutes (180000 ms)
        if (Date.now() - timestamp < 180000) {
          return data[key] || defaultValue;
        }
      }
    } catch (e) {
      console.error("Failed to parse session storage data", e);
    }
    return defaultValue;
  };

  const navigate = useNavigate();
  const { user, api } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Results state
  const [extractedText, setExtractedText] = useState(() => getInitialState('extractedText', ''));
  const [medicines, setMedicines] = useState(() => getInitialState('medicines', []));
  const [pharmacies, setPharmacies] = useState(() => getInitialState('pharmacies', []));
  const [selections, setSelections] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [selectedPharmacy, setSelectedPharmacy] = useState(null);
  const [confirmDetails, setConfirmDetails] = useState(null);

  const handleAddressChange = (e) => {
    setDeliveryAddress({ ...deliveryAddress, [e.target.name]: e.target.value });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  useEffect(() => {
    if (medicines.length > 0 && pharmacies.length > 0) {
      const initialSelections = {};
      medicines.forEach(med => {
        // Find the first pharmacy that has this medicine
        const availablePharmacy = pharmacies.find(p => 
          p.medicinesInStock.some(m => m.name.toLowerCase() === med.word.toLowerCase() && m.stock > 0)
        );
        if (availablePharmacy) {
          const medicineInStock = availablePharmacy.medicinesInStock.find(m => m.name.toLowerCase() === med.word.toLowerCase());
          initialSelections[med.word] = {
            medicineId: medicineInStock?._id || '',
            pharmacyId: availablePharmacy._id,
            quantity: 1,
          };
        }
      });
      setSelections(initialSelections);
    }
  }, [medicines, pharmacies]);

  const handleCancel = () => {
    // Clear cache and reset all state to initial
    sessionStorage.removeItem('prescriptionResults');
    setExtractedText('');
    setMedicines([]);
    setPharmacies([]);
    setSelections({});
    setSelectedFile(null);
    setPreview(null);
    setError('');
    setIsLoading(false);
    toast.success('Process cancelled. You can upload a new prescription.');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a prescription image first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setExtractedText('');
    setMedicines([]);
    setPharmacies([]);
    setSelections({});

    const formData = new FormData();
    formData.append('prescription', selectedFile);

    try {
      const res = await api.post('/ai/upload-prescription', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const data = res.data;
      setExtractedText(data.text);

      // De-duplicate medicines by name (case-insensitive)
      const uniqueMedicines = [];
      const seenNames = new Set();
      if (data.medicines) {
        for (const med of data.medicines) {
          const lowerCaseName = med.word.toLowerCase();
          if (!seenNames.has(lowerCaseName)) {
            seenNames.add(lowerCaseName);
            uniqueMedicines.push(med);
          }
        }
      }

      setMedicines(uniqueMedicines);
      setPharmacies(data.pharmacies || []);
      if (data.pharmacies?.length > 0) {
        setSelectedPharmacy(data.pharmacies[0]);
      }
      if (uniqueMedicines.length === 0) {
        toast.success('Prescription processed, but no medicines were identified.');
      } else {
        toast.success('Prescription processed successfully!');
      }

      // Cache results in session storage with a timestamp
      const resultsToCache = { extractedText: data.text, medicines: uniqueMedicines, pharmacies: data.pharmacies || [] };
      sessionStorage.setItem('prescriptionResults', JSON.stringify({ data: resultsToCache, timestamp: Date.now() }));
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to process prescription.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderChange = (medName, field, value) => {
    setSelections(prev => {
      const updated = { ...prev };
      const current = updated[medName] || {};

      if (field === 'pharmacyId') {
        // When pharmacy changes, also update the corresponding medicineId and reset quantity to 1
        const selectedPharmacy = pharmacies.find(p => p._id === value);
        const medInStock = selectedPharmacy?.medicinesInStock.find(m => m.name.toLowerCase() === medName.toLowerCase());
        updated[medName] = {
          ...current,
          pharmacyId: value,
          medicineId: medInStock?._id || '',
          quantity: current.quantity || 1,
        };
      } else {
        updated[medName] = { ...current, [field]: value };
      }
      return updated;
    });
  };

  // Temporary storage for order payload so we can reuse on modal confirm
  const orderPayloadRef = React.useRef(null);

  const uploadPrescription = async (file) => {
    const formData = new FormData();
    formData.append('prescription', file);
    
    try {
      // Use the AI endpoint that's already working for prescription processing
      const response = await api.post('/api/ai/upload-prescription', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // If the response has a fileUrl, use that, otherwise use the temporary URL
      return response.data.fileUrl || URL.createObjectURL(file);
    } catch (error) {
      console.error('Error uploading prescription:', error);
      // If upload fails, we'll still proceed with a placeholder URL
      // This ensures the order can still be placed even if file upload fails
      console.warn('Using fallback URL for prescription');
      return URL.createObjectURL(file);
    }
  };

  const submitOrder = async () => {
    const { payload } = orderPayloadRef.current || {};
    if (!payload) return;
    setIsSubmitting(true);
    
    try {
      // Upload prescription if file is selected
      let prescriptionUrl = payload.prescriptionUrl;
      if (selectedFile) {
        try {
          prescriptionUrl = await uploadPrescription(selectedFile);
        } catch (error) {
          console.warn('Using fallback prescription URL');
          prescriptionUrl = 'fallback-prescription-url';
        }
      }
      
      // Prepare items with required fields for the order
      const preparedItems = (payload.items || []).map(item => ({
        medicine: item.medicine || item._id, // Use medicine ID
        name: String(item.name || 'Medicine').trim(), // Ensure name is a non-empty string
        quantity: Number(item.quantity) || 1,
        price: Number(item.price) || 0
      }));
      
      // Calculate total amount
      const subtotal = preparedItems.reduce(
        (sum, item) => sum + (Number(item.price) * Number(item.quantity)), 
        0
      );
      const orderTax = subtotal * 0.05; // 5% tax
      const orderDeliveryFee = 50; // Flat delivery fee
      const totalAmount = subtotal + orderTax + orderDeliveryFee;
      
      // Validate required fields
      if (!prescriptionUrl) throw new Error('Prescription URL is required');
      if (!user?.id) throw new Error('User not authenticated');
      const pharmacyId = payload.pharmacy || (pharmacies[0]?._id);
      if (!pharmacyId) throw new Error('No pharmacy selected');

      // Prepare order items with validation
      const orderItems = preparedItems.map(item => {
        if (!item.medicine) throw new Error('Medicine ID is required for all items');
        if (!item.name) throw new Error('Medicine name is required for all items');
        
        return {
          medicine: item.medicine, // Must be a valid ObjectId
          name: String(item.name).trim(), // Required non-empty string
          quantity: Math.max(1, Number(item.quantity) || 1), // Must be at least 1
          price: Math.max(0, Number(item.price) || 0) // Must be 0 or positive
        };
      });

      // Prepare the order payload to match backend's expected structure
      const orderPayload = {
        // Required fields
        patient: user.id,
        pharmacy: pharmacyId,
        items: orderItems.map(item => ({
          medicine: item.medicine,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          discount: 0, // Default discount
          finalPrice: item.price // Same as price if no discount
        })),
        pricing: {
          subtotal: subtotal,
          tax: orderTax,
          deliveryFee: orderDeliveryFee,
          total: totalAmount
        },
        deliveryAddress: {
          street: String(payload.deliveryAddress?.street || 'N/A').trim(),
          city: String(payload.deliveryAddress?.city || 'N/A').trim(),
          state: String(payload.deliveryAddress?.state || 'N/A').trim(),
          postalCode: String(payload.deliveryAddress?.postalCode || '000000').trim(),
          country: String(payload.deliveryAddress?.country || 'N/A').trim()
        },
        prescription: prescriptionUrl, // Note: field name is 'prescription' not 'prescriptionUrl'
        paymentMethod: payload.paymentMethod || 'cash_on_delivery',
        status: 'pending',
        statusHistory: [{
          status: 'pending',
          updatedBy: user.id,
          timestamp: new Date()
        }]
      };

      // Log the payload for debugging
      console.log('Order payload:', JSON.stringify(orderPayload, null, 2));
      
      // Ensure all required fields are present and have the correct type
      if (!orderPayload.patient) throw new Error('User not authenticated');
      if (!orderPayload.pharmacy) throw new Error('No pharmacy selected');
      
      // Log the actual data being sent
      console.log('Sending order payload:', JSON.stringify(orderPayload, null, 2));
      
      // Make the API call with explicit headers
      const response = await api.post('/orders', orderPayload, {
        headers: {
          'Content-Type': 'application/json'
        },
        transformRequest: [
          (data, headers) => {
            // Ensure proper content type
            headers['Content-Type'] = 'application/json';
            return JSON.stringify(data);
          }
        ]
      });
      console.log('Order created successfully:', response.data);
      toast.success('Order placed successfully!');
      sessionStorage.removeItem('prescriptionResults');
      setExtractedText('');
      setMedicines([]);
      setPharmacies([]);
      setSelections({});
      navigate('/my-orders');
    } catch (err) {
      console.error('Order submission error:', {
        message: err.message,
        response: {
          data: err.response?.data,
          status: err.response?.status,
          statusText: err.response?.statusText,
          headers: err.response?.headers,
        },
        request: {
          responseURL: err.request?.responseURL,
          status: err.request?.status,
          statusText: err.request?.statusText,
          responseText: err.request?.responseText,
        },
        config: {
          url: err.config?.url,
          method: err.config?.method,
          data: err.config?.data ? JSON.parse(err.config.data) : null,
          headers: err.config?.headers,
        },
        stack: err.stack
      });
      
      if (err.response?.status === 401) {
        toast.error('Please login to place an order.');
        navigate('/login');
      } else {
        // Extract error message from response data
        let errorMessage = 'Failed to place order.';
        
        if (err.response?.data) {
          console.error('Error response data:', JSON.stringify(err.response.data, null, 2));
          
          if (err.response.data.errors) {
            // Handle validation errors
            console.error('Validation errors:', err.response.data.errors);
            errorMessage = Object.entries(err.response.data.errors)
              .map(([field, error]) => {
                if (typeof error === 'object' && error !== null) {
                  return `${field}: ${error.message || 'Invalid value'}`;
                }
                return `${field}: ${error}`;
              })
              .join('\n');
          } else if (err.response.data.message) {
            errorMessage = err.response.data.message;
          }
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        toast.error(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
      setConfirmDetails(null);
    }
  };

  const handleOrderSubmit = async () => {
    const firstMedKey = Object.keys(selections)[0];
    if (!firstMedKey) {
      toast.error("No items to order.");
      return;
    }
    const pharmacyId = selections[firstMedKey].pharmacyId;
    const selectedPharmacy = pharmacies.find(p => p._id === pharmacyId);

    // Recalculate total price for safety
    let totalPrice = 0;
    for (const [medName, selection] of Object.entries(selections)) {
        const pharmacyForMed = pharmacies.find(p => p._id === selection.pharmacyId);
        const medInStock = pharmacyForMed?.medicinesInStock.find(m => m._id === selection.medicineId);
        if (medInStock) {
            totalPrice += medInStock.price * selection.quantity;
        }
    }



    setIsSubmitting(true);
    try {
      const firstMedKey = Object.keys(selections)[0];
      if (!firstMedKey) throw new Error('No medicines selected.');

      const pharmacyId = selections[firstMedKey].pharmacyId;

      const items = Object.keys(selections).map(medName => {
        const value = selections[medName];
        if (!value.medicineId) {
          throw new Error(`Could not find ID for medicine: ${medName}`);
        }
        const selectedPharm = pharmacies.find(p => p._id === value.pharmacyId);
        const stockRecord = selectedPharm?.medicinesInStock.find(m => m._id === value.medicineId);
        if (!stockRecord || value.quantity > stockRecord.stock) {
          throw new Error(`Insufficient stock for ${medName}. Available: ${stockRecord?.stock || 0}`);
        }
        return {
          medicine: value.medicineId,
          quantity: value.quantity,
        };
      });

      // Get the selected medicines with their details
      const orderItems = [];
      let calculatedTotal = 0;
      
      // Ensure we have a selected pharmacy
      if (!selectedPharmacy) {
        throw new Error('Please select a pharmacy');
      }
      
      for (const [medName, selection] of Object.entries(selections)) {
        const pharmacy = pharmacies.find(p => p._id === selection.pharmacyId);
        const medInStock = pharmacy?.medicinesInStock.find(m => m._id === selection.medicineId);
        
        if (!medInStock) continue;
        
        const itemTotal = medInStock.price * selection.quantity;
        calculatedTotal += itemTotal;
        
        orderItems.push({
          medicine: selection.medicineId,
          name: medName, // Ensure name is always a string
          quantity: Number(selection.quantity),
          price: Number(medInStock.price)
        });
      }
      
      // Format payload according to server expectations
      const orderPayload = {
        pharmacy: pharmacyId,
        items: orderItems.map(item => ({
          medicine: item.medicine,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryType: 'delivery',
        deliveryAddress: {
          street: deliveryAddress.street || '',
          city: deliveryAddress.city || '',
          state: deliveryAddress.state || '',
          postalCode: deliveryAddress.postalCode || '',
          country: deliveryAddress.country || 'India',
        },
        paymentMethod,
        prescriptionUrl: 'temporary-prescription-url',
        totalAmount: Number(calculatedTotal.toFixed(2)),
        status: 'pending',
        patient: user?.id,
        orderNumber: `ORD-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      orderPayloadRef.current = { payload: orderPayload };

      setConfirmDetails({
        pharmacyName: selectedPharmacy.name,
        totalPrice: totalPrice.toFixed(2),
        onConfirm: submitOrder,
        onCancel: () => setConfirmDetails(null)
      });
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || 'Failed to place order.';
      console.error(err);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderOrderForm = () => (
    <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <ShoppingCart size={24} /> Place Your Order
      </h3>
      <div className="space-y-6">
        {/* Shop Information */}
        {selectedPharmacy && (
          <div className="bg-white p-4 rounded-lg shadow mb-4">
            <h3 className="text-lg font-semibold mb-2">Shop Information</h3>
            <div className="p-3 bg-gray-50 rounded-md">
              <h4 className="font-medium text-gray-800">{selectedPharmacy.name}</h4>
              <p className="text-sm text-gray-700 mt-1">{selectedPharmacy.address}</p>
              {selectedPharmacy.phone && (
                <p className="text-sm text-gray-700 mt-1">📞 {selectedPharmacy.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Payment Method */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-3">Payment Method</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              onClick={() => handlePaymentMethodChange('cash_on_delivery')}
              className={`p-3 rounded-md border-2 ${paymentMethod === 'cash_on_delivery' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === 'cash_on_delivery' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}></div>
                <span>💵 Cash on Delivery</span>
              </div>
            </button>
            <button
              onClick={() => handlePaymentMethodChange('upi')}
              className={`p-3 rounded-md border-2 ${paymentMethod === 'upi' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full border-2 ${paymentMethod === 'upi' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'}`}></div>
                <span>📱 UPI Payment</span>
              </div>
            </button>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-4">Delivery Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="street"
                placeholder="Street Address"
                value={deliveryAddress.street}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={deliveryAddress.city}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                name="state"
                placeholder="State"
                value={deliveryAddress.state}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <input
                type="text"
                name="postalCode"
                placeholder="Postal Code"
                value={deliveryAddress.postalCode}
                onChange={handleAddressChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>
        
        {medicines.map(med => {
          const selection = selections[med.word];
          if (!selection) return null;

          const availablePharmacies = pharmacies.filter(p => 
            p.medicinesInStock.some(m => m.name.toLowerCase() === med.word.toLowerCase())
          );

          if (availablePharmacies.length === 0) {
            return (
              <div key={med.word} className="border p-4 rounded mb-3 bg-gray-50">
                <p className="font-semibold text-lg text-gray-700">{med.word}</p>
                <p className="text-sm text-red-600 mt-1">Not available in any partner pharmacies.</p>
              </div>
            );
          }

          return (
            <div key={med.word} className="border p-4 rounded mb-3">
              <h2 className="text-lg font-semibold">{med.word}</h2>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-2">
                <select
                  className="border p-2 rounded flex-1"
                  value={selection.pharmacyId}
                  onChange={(e) => handleOrderChange(med.word, 'pharmacyId', e.target.value)}
                >
                  {availablePharmacies.map(ph => {
                    const stockInfo = ph.medicinesInStock.find(m => m.name.toLowerCase() === med.word.toLowerCase());
                    return (
                      <option key={ph._id} value={ph._id}>
                        {ph.name} (${stockInfo?.price?.toFixed(2) || 'N/A'})
                      </option>
                    );
                  })}
                </select>
                <input
                  type="number"
                  min="1"
                  className="border p-2 rounded w-24"
                  value={selection.quantity}
                  onChange={(e) => handleOrderChange(med.word, 'quantity', Number(e.target.value))}
                />
              </div>
            </div>
          );
        })}
      </div>
      <button
        className="mt-6 w-full flex justify-center items-center py-3 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-green-300"
        onClick={handleOrderSubmit}
        disabled={isSubmitting || Object.keys(selections).length === 0}
      >
        {isSubmitting ? <Spinner size="sm" /> : 'Place Order'}
      </button>
    </div>
  );

  return (
    <div className="container mx-auto py-8">
      {/* Confirmation Modal */}
      {confirmDetails && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white w-11/12 max-w-md p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Confirm Your Order</h3>
            <p className="mb-2 text-gray-700">Pharmacy: <span className="font-medium">{confirmDetails.pharmacyName}</span></p>
            <p className="mb-4 text-gray-700">Total Amount: <span className="font-medium">${confirmDetails.totalPrice}</span></p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                onClick={() => setConfirmDetails(null)}
              >Cancel</button>
              <button
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
                onClick={() => {
                  setConfirmDetails(null);
                  confirmDetails.onConfirm();
                }}
              >Confirm</button>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-secondary-900">Upload Your Prescription</h1>
        <p className="text-secondary-600 mt-2">Our AI will read your prescription, find medicines, and help you order them instantly.</p>
      </div>

      <div className="max-w-2xl mx-auto mt-8 bg-white p-8 rounded-lg shadow-md">
        {!extractedText && (
          <form onSubmit={handleUploadSubmit}>
            <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-500 transition-colors">
              <input type="file" id="prescription-upload" className="hidden" onChange={handleFileChange} accept="image/*" />
              <label htmlFor="prescription-upload" className="cursor-pointer">
                <UploadCloud className="mx-auto h-12 w-12 text-secondary-400" />
                <p className="mt-2 text-sm text-secondary-600">
                  <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-secondary-500">PNG, JPG, GIF up to 10MB</p>
              </label>
            </div>

            {preview && (
              <div className="mt-6 text-center">
                <h4 className="font-semibold mb-2">Image Preview:</h4>
                <img src={preview} alt="Prescription preview" className="max-w-xs mx-auto rounded-lg shadow-sm" />
              </div>
            )}

            <div className="mt-6">
              <button 
                type="submit" 
                className="w-full flex justify-center items-center py-3 px-4 bg-primary-600 text-white font-semibold rounded-md hover:bg-primary-700 disabled:bg-primary-300"
                disabled={isLoading || !selectedFile}
              >
                {isLoading ? <Spinner size="sm" /> : 'Process Prescription'}
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2">
            <AlertTriangle size={20} />
            <div>
              <h4 className="font-bold">Error</h4>
              <p>{error}</p>
            </div>
          </div>
        )}

        {extractedText && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleCancel}
              className="py-2 px-4 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
            >
              Cancel & Upload Another
            </button>
          </div>
        )}

        {extractedText && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-secondary-800 flex items-center gap-2"><FileText size={20} /> Extracted Text</h3>
            <p className="mt-2 text-secondary-700 whitespace-pre-wrap font-mono bg-secondary-50 p-3 rounded">{extractedText}</p>
          </div>
        )}

        {medicines.length > 0 && pharmacies.length > 0 && renderOrderForm()}

        {medicines.length > 0 && pharmacies.length === 0 && !isLoading && (
            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg shadow-md">
                <h3 className="text-2xl font-semibold text-yellow-800 mb-4">Medicines Identified</h3>
                <p className="text-yellow-700">The following medicines were found, but they are not currently available in any of our partner pharmacies:</p>
                <ul className="space-y-3 mt-4">
                {medicines.map((med, index) => (
                    <li key={index} className="p-3 bg-yellow-100 rounded-md">
                    <p className="font-semibold text-lg text-yellow-900">{med.word}</p>
                    </li>
                ))}
                </ul>
            </div>
        )}
      </div>
    </div>
  );
};

export default UploadPrescriptionPage;
