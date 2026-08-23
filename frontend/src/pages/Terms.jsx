import React from 'react';
import { Link } from 'react-router-dom';

const Terms = () => {
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
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', color: '#1C1C1C', marginBottom: '24px' }}>Terms of Service</h1>
        <div style={{ color: '#4A4A4A', fontSize: '16px', lineHeight: '1.8' }}>
          <p className="mb-4"><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
          <p className="mb-6">
            Please read these Terms of Service ("Terms") carefully before using the Awaastech platform. By accessing or using our services, you agree to be bound by these Terms.
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#1C1C1C', marginTop: '32px', marginBottom: '16px' }}>1. Use of the Services</h2>
          <p className="mb-6">
            You may use our services only as permitted by law. We may suspend or stop providing our services to you if you do not comply with our terms or policies or if we are investigating suspected misconduct.
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#1C1C1C', marginTop: '32px', marginBottom: '16px' }}>2. Your Account</h2>
          <p className="mb-6">
            You may need an Awaastech account to use some of our services. You are responsible for safeguarding the password that you use to access the services and for any activities or actions under your password.
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#1C1C1C', marginTop: '32px', marginBottom: '16px' }}>3. Modifying and Terminating our Services</h2>
          <p className="mb-6">
            We are constantly changing and improving our services. We may add or remove functionalities or features, and we may suspend or stop a service altogether. You can stop using our services at any time.
          </p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: '#1C1C1C', marginTop: '32px', marginBottom: '16px' }}>4. Warranties and Disclaimers</h2>
          <p className="mb-6">
            We provide our services using a commercially reasonable level of skill and care. However, we do not make any specific promises about the services, their reliability, availability, or ability to meet your needs. We provide the services "as is".
          </p>
        </div>
      </main>

      <footer className="py-6 text-center" style={{ backgroundColor: '#1C1C1C', color: '#A0A0A0', fontSize: '14px' }}>
        <p>© {new Date().getFullYear()} AwaasTech Inc. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Terms;
