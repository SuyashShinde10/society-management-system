import React from 'react';
import { Link } from 'react-router-dom';

const Security = () => {
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
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', color: '#1C1C1C', marginBottom: '24px' }}>Platform Security</h1>
        <div style={{ color: '#4A4A4A', fontSize: '16px', lineHeight: '1.8' }}>
          <p className="mb-6">
            At Awaastech, the security of your data and the physical safety of your community are our top priorities. We employ enterprise-grade security protocols to ensure that all information remains confidential, integral, and available only to authorized users.
          </p>
          <ul className="list-disc pl-6 space-y-4">
            <li><strong>End-to-End Encryption:</strong> All sensitive data, including financial ledgers and personal contact details, is encrypted both in transit and at rest.</li>
            <li><strong>Role-Based Access Control (RBAC):</strong> Strict permission models ensure that admins, members, and security staff only have access to the data necessary for their specific roles.</li>
            <li><strong>Secure Authentication:</strong> Implementing OTP-based verification for critical actions, including new member onboarding and security staff registration.</li>
            <li><strong>Continuous Monitoring:</strong> Regular security audits and automated threat detection safeguard the platform against unauthorized access and vulnerabilities.</li>
          </ul>
        </div>
      </main>

      <footer className="py-6 text-center" style={{ backgroundColor: '#1C1C1C', color: '#A0A0A0', fontSize: '14px' }}>
        <p>© {new Date().getFullYear()} AwaasTech Inc. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default Security;
