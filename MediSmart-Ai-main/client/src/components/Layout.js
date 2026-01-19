import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-secondary-50 font-sans">
      <Header />
      <main className="flex-grow py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
