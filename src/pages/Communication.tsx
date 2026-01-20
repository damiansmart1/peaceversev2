import React from 'react';
import Navigation from '@/components/Navigation';
import CommunicationHub from '@/components/communication/CommunicationHub';

const Communication: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <CommunicationHub />
      </main>
    </div>
  );
};

export default Communication;
