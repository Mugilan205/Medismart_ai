import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Tag } from 'lucide-react';

const MedicineCard = ({ medicine }) => {
  const isAvailable = medicine.stock > 0 && typeof medicine.price !== 'undefined';
  const navigate = useNavigate();

  return (
    <div className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      <div className="relative">
        <img 
          src={
            (typeof medicine.imageUrl === 'string' && /^https?:\/\//i.test(medicine.imageUrl))
              ? medicine.imageUrl
              : `https://source.unsplash.com/600x400/?medicine,pharmacy,${encodeURIComponent(medicine.name || 'medicine')}`
          } 
          alt={medicine.name}
          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          {medicine.category || 'General'}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-secondary-800 truncate" title={medicine.name}>
          {medicine.name}
        </h3>
        <p className="text-sm text-secondary-500 mb-2">by {medicine.brand || 'Unknown Brand'}</p>
        
        <div className="flex items-center text-sm text-secondary-600 mb-4">
          <Pill size={14} className="mr-1" />
          <span>{medicine.dosage?.form} - {medicine.dosage?.strength}</span>
        </div>

        <div className="flex justify-between items-center">
          {isAvailable ? (
            <p className="text-xl font-bold text-primary-600">
              ${medicine.price.toFixed(2)}
            </p>
          ) : (
            <p className="text-sm text-secondary-500">Not available</p>
          )}
          <button
            type="button"
            onClick={() => navigate(`/order/now/${medicine._id}`)}
            className="text-xs text-white bg-primary-600 hover:bg-primary-700 font-semibold rounded-full px-3 py-1"
          >
            Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;
