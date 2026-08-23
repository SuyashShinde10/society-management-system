import React from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
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
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', color: '#1C1C1C', marginBottom: '24px' }}>Contact Us</h1>
        <div style={{ color: '#4A4A4A', fontSize: '16px', lineHeight: '1.8' }}>
          <p className="mb-8">
            Whether you are looking to deploy Awaastech in your society, have a question about our features, or need technical support, our team is here to help.
          </p>
          
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-xl">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: '#1C1C1C', marginBottom: '16px' }}>Get in Touch</h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-4">
                <div className="mt-1 bg-gray-50 p-3 rounded-lg text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Email Support & Inquiries</h3>
                  <p className="text-gray-500 mb-2">Our team responds within 24 hours on business days.</p>
                  <a href="mailto:support@awaastech.com" className="text-[#E45F2B] font-medium hover:underline">
                    support@awaastech.com
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            Awaastech Inc.<br/>
            Corporate Headquarters<br/>
            123 Innovation Drive, Tech Park
          </p>
        </div>
      </main>

      <footer className="py-6 text-center" style={{ backgroundColor: '#1C1C1C', color: '#A0A0A0', fontSize: '14px' }}>
        <p>© {new Date().getFullYear()} AwaasTech Inc. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Contact;
