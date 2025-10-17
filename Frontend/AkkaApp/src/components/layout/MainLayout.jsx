// src/components/layout/MainLayout.jsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../common/Header';

function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-6 py-8">
        {/* Child routes will be rendered here */}
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;