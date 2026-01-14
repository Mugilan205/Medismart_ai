import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import { useAuth } from '../context/AuthProvider';
import Spinner from '../components/common/Spinner';
import { Pill, Building, Tag, MapPin, DollarSign, Package } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const fetchMedicineById = async (api, id) => {
  const { data } = await api.get(`/medicines/${id}`);
  return data;
};

const MedicineDetailPage = () => {
  const { id } = useParams();
  const { api } = useAuth();

  const { data: medicine, isLoading, isError, error } = useQuery(
    ['medicine', id],
    () => fetchMedicineById(api, id)
  );

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
  }

  if (isError) {
    return <div className="text-center text-red-500 py-10">Error: {error.message}</div>;
  }

  const pharmacy = medicine.pharmacy;
  const hasLocation = pharmacy?.location?.coordinates?.length === 2;
  const mapCenter = hasLocation
    ? [pharmacy.location.coordinates[1], pharmacy.location.coordinates[0]]
    : [51.505, -0.09]; // Default location if no coordinates

  return (
    <div className="container mx-auto py-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Image and Details */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-8">
              <img 
                src={
                  (typeof medicine.imageUrl === 'string' && /^https?:\/\//i.test(medicine.imageUrl))
                    ? medicine.imageUrl
                    : `https://source.unsplash.com/800x600/?medicine,pharmacy,${encodeURIComponent(medicine.name || 'medicine')}`
                }
                alt={medicine.name}
                className="w-full md:w-1/3 h-auto object-cover rounded-lg"
              />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-secondary-900">{medicine.name}</h1>
                <p className="text-secondary-600 mt-1">by {medicine.brand || 'N/A'}</p>
                <div className="flex items-center gap-4 mt-4 text-sm">
                  <span className="flex items-center gap-1"><Pill size={16} /> {medicine.dosage?.form || 'N/A'} - {medicine.dosage?.strength || 'N/A'}</span>
                  <span className="flex items-center gap-1"><Tag size={16} /> {medicine.category || 'N/A'}</span>
                </div>
                <p className="text-secondary-700 mt-4">{medicine.description || 'No description available.'}</p>
              </div>
            </div>
          </div>

          {/* Pharmacy Info */}
          {pharmacy && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-secondary-800 mb-4">Available At</h2>
              <div className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2"><Building size={20} /> {pharmacy.name}</h3>
                  <p className="text-sm text-secondary-500 flex items-center gap-2 mt-1"><MapPin size={14} /> {pharmacy.address}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-primary-600 flex items-center justify-end gap-1"><DollarSign size={20} />{medicine.price.toFixed(2)}</p>
                  <p className={`text-sm font-semibold ${medicine.stock > 0 ? 'text-green-600' : 'text-red-500'} flex items-center justify-end gap-1`}>
                    <Package size={14} /> {medicine.stock > 0 ? `${medicine.stock} in stock` : 'Out of stock'}
                  </p>
                  <button className="mt-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-md hover:bg-primary-700 disabled:bg-primary-300" disabled={medicine.stock === 0}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Map */}
        <div className="lg:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow-md sticky top-24">
            <h3 className="text-lg font-semibold mb-4">Pharmacy Locations</h3>
            <div className="h-96 rounded-lg overflow-hidden">
              <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {hasLocation && (
                  <Marker position={[pharmacy.location.coordinates[1], pharmacy.location.coordinates[0]]}>
                    <Popup>
                      <b>{pharmacy.name}</b><br/>
                      Price: ${medicine.price.toFixed(2)}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetailPage;
