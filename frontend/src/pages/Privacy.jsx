import React from 'react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div style={{ backgroundColor: '#F9F8F3', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="px-6 md:px-[60px] py-6 flex justify-between items-center" style={{ backgroundColor: '#1C1C1C', color: 'white' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/awaastech-logo.png" alt="Awaastech" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          </div>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: '600', color: 'white' }}>Awaastech</span>
        </Link>
        <Link to="/" className="px-4 py-2 rounded-md transition-opacity hover:opacity-90" style={{ backgroundColor: '#E45F2B', color: 'white', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
          Back to Home
        </Link>
      </header>
      
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12">
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', color: '#1C1C1C', marginBottom: '24px' }}>Privacy Policy</h1>
        <div style={{ color: '#4A4A4A', fontSize: '16px', lineHeight: '1.8' }}>
          <p className="mb-4"><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
          <p className="mb-6">
            Awaastech ("we", "our", or "us") is committed to protecting the privacy and security of your personal information. This Privacy Policy describes how we collect, use, and share information about you when you use our society management platform.
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#1C1C1C', marginTop: '32px', marginBottom: '16px' }}>Information We Collect</h2>
          <p className="mb-6">
            We collect information you provide directly to us, such as when you register for an account, pay your maintenance dues, or submit a grievance. This includes contact details, financial transaction records (processed securely), and communication logs.
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#1C1C1C', marginTop: '32px', marginBottom: '16px' }}>How We Use Information</h2>
          <p className="mb-6">
            We use the information we collect to provide, maintain, and improve our services; process transactions; send notices and updates; and respond to your comments and questions. We never sell your personal data to third parties.
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#1C1C1C', marginTop: '32px', marginBottom: '16px' }}>Security</h2>
          <p className="mb-6">
            We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.
          </p>
        </div>
      </main>

      <footer className="py-6 text-center" style={{ backgroundColor: '#1C1C1C', color: '#A0A0A0', fontSize: '14px' }}>
        <p>© {new Date().getFullYear()} AwaasTech Inc. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Privacy;
