import React from 'react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
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
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', color: '#1C1C1C', marginBottom: '24px' }}>About Awaastech</h1>
        <div style={{ color: '#4A4A4A', fontSize: '16px', lineHeight: '1.8' }}>
          <p className="mb-6">
            Awaastech was founded with a singular vision: to bring operational excellence and premium technology to housing societies across the country. 
            We recognized that managing modern communities requires more than just spreadsheets and legacy software; it requires a specialized, robust operating system.
          </p>
          <p className="mb-6">
            Our team is composed of passionate engineers, designers, and community management experts who are dedicated to building solutions that are not only powerful but also intuitive and beautifully designed.
          </p>
          <p>
            By bridging the gap between cutting-edge AI technologies and daily community operations, Awaastech provides a seamless, secure, and stress-free environment for administrators, residents, and security personnel alike.
          </p>
        </div>
      </main>

      <footer className="py-6 text-center" style={{ backgroundColor: '#1C1C1C', color: '#A0A0A0', fontSize: '14px' }}>
        <p>© {new Date().getFullYear()} AwaasTech Inc. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default AboutUs;
