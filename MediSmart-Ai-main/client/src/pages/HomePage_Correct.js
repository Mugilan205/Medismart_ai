import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { Search, UploadCloud, Truck, ShieldCheck } from 'lucide-react';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md text-center">
    {icon}
    <h3 className="text-xl font-bold mt-4 mb-2 text-secondary-800">{title}</h3>
    <p className="text-secondary-600">{description}</p>
  </div>
);

const HomePage = () => {
  const { user } = useAuth();

  return (
    <div className="bg-secondary-50">
      {/* Hero Section */}
      <section className="bg-primary-600 text-white">
        <div className="container mx-auto text-center py-20">
          <h1 className="text-5xl font-extrabold mb-4">Your Health, Delivered.</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">Compare medicine prices, upload prescriptions, and get your medications delivered right to your doorstep.</p>
          
          {/* CTA Buttons - Only show if user is not logged in */}
          {!user && (
            <div className="flex justify-center gap-4">
              <Link to="/medicines" className="bg-white text-primary-600 font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-secondary-100 transition-transform transform hover:scale-105">
                Search Medicines
              </Link>
              <Link to="/upload-prescription" className="bg-transparent border-2 border-white text-white font-bold py-3 px-6 rounded-lg hover:bg-white hover:text-primary-600 transition-colors">
                Upload Prescription
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-secondary-900">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Search size={48} className="mx-auto text-primary-500" />} 
              title="Search & Compare"
              description="Find your medicines and compare prices from various pharmacies near you."
            />
            <FeatureCard 
              icon={<UploadCloud size={48} className="mx-auto text-primary-500" />} 
              title="Upload Prescription"
              description="Easily upload your doctor's prescription for a quick and seamless order."
            />
            <FeatureCard 
              icon={<ShieldCheck size={48} className="mx-auto text-primary-500" />} 
              title="Verified Pharmacies"
              description="We partner with trusted and verified pharmacies to ensure quality and safety."
            />
            <FeatureCard 
              icon={<Truck size={48} className="mx-auto text-primary-500" />} 
              title="Fast Delivery"
              description="Get your medicines delivered to your home, quickly and reliably."
            />
          </div>
        </div>
      </section>

      {/* Call to Action for account creation - Only show if user is not logged in */}
      {!user && (
        <section className="bg-primary-500 text-white">
          <div className="container mx-auto text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="mb-6">Create an account to manage your orders, track deliveries, and more.</p>
            <Link to="/register" className="bg-white text-primary-600 font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-secondary-100 transition-transform transform hover:scale-105">
              Create Your Account
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
