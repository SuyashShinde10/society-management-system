import React, { useState, useEffect } from 'react';
import api from '../api';
import theme from '../theme';
import { toast } from 'sonner';
import { Car, MapPin, AlertCircle, CheckCircle } from 'lucide-react';

const SmartParking = () => {
  const [spaces, setSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Enforcement state
  const [lat, setLat] = useState('12.9005');
  const [lng, setLng] = useState('77.5005');
  const [plate, setPlate] = useState('MH-12-CD-5678');
  const [enforceResult, setEnforceResult] = useState(null);

  useEffect(() => {
    fetchSpaces();
  }, []);

  const fetchSpaces = async () => {
    try {
      const res = await api.get('/parking');
      setSpaces(res.data);
    } catch (error) {
      toast.error('Failed to fetch parking spaces');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnforce = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/parking/enforce', {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        vehicleNumber: plate
      });
      setEnforceResult(res.data);
      if (res.data.status === 'VIOLATION') {
        toast.error('Parking Violation Detected!');
      } else {
        toast.success('Vehicle is parked correctly.');
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setEnforceResult({ message: 'No parking space found at these coordinates.', status: 'NOT_FOUND' });
        toast.info('No parking space at this location.');
      } else {
        toast.error('Error enforcing parking');
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px' }}>
        <div style={{ background: '#E0F2FE', padding: '10px', borderRadius: '12px' }}>
          <Car size={24} color="#0284C7" />
        </div>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
          Smart Parking & Enforcement
        </h3>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Enforce Module */}
        <div style={{ flex: 1, minWidth: '300px', background: 'white', borderRadius: '24px', padding: '30px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <MapPin size={20} color={theme.accent} /> Drop Geospatial Pin
          </h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: theme.textSec }}>
            Simulate a security guard checking a vehicle. Enter the GPS coordinates and the vehicle's license plate.
          </p>

          <form onSubmit={handleEnforce} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: theme.textSec }}>Latitude</label>
              <input 
                type="text" 
                value={lat} 
                onChange={(e) => setLat(e.target.value)} 
                required 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: '#F9F8F3', outline: 'none', fontFamily: "'Outfit', sans-serif" }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: theme.textSec }}>Longitude</label>
              <input 
                type="text" 
                value={lng} 
                onChange={(e) => setLng(e.target.value)} 
                required 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: '#F9F8F3', outline: 'none', fontFamily: "'Outfit', sans-serif" }} 
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: theme.textSec }}>Vehicle Plate</label>
              <input 
                type="text" 
                value={plate} 
                onChange={(e) => setPlate(e.target.value)} 
                required 
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: '#F9F8F3', outline: 'none', fontFamily: "'Outfit', sans-serif" }} 
              />
            </div>
            <button 
              type="submit" 
              style={{ padding: '14px', background: theme.textMain, color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: '600', marginTop: '10px' }}
            >
              Verify Parking Location
            </button>
          </form>

          {enforceResult && (
            <div style={{ marginTop: '20px', padding: '15px', borderRadius: '12px', background: enforceResult.status === 'VIOLATION' ? '#FEF2F2' : enforceResult.status === 'OK' ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${enforceResult.status === 'VIOLATION' ? '#FECACA' : enforceResult.status === 'OK' ? '#BBF7D0' : '#E2E8F0'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: enforceResult.status === 'VIOLATION' ? '#DC2626' : enforceResult.status === 'OK' ? '#16A34A' : '#64748B', fontWeight: '600' }}>
                {enforceResult.status === 'VIOLATION' ? <AlertCircle size={20} /> : enforceResult.status === 'OK' ? <CheckCircle size={20} /> : <MapPin size={20} />}
                {enforceResult.status === 'VIOLATION' ? 'Violation Detected' : enforceResult.status === 'OK' ? 'Verified' : 'No Space Found'}
              </div>
              <p style={{ margin: '10px 0 0 0', fontSize: '14px', color: '#475569' }}>
                {enforceResult.message}
              </p>
            </div>
          )}
        </div>

        {/* List Module */}
        <div style={{ flex: 1, minWidth: '300px', background: 'white', borderRadius: '24px', padding: '30px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: theme.textMain }}>Allocated Spaces</h3>
          {isLoading ? (
            <p>Loading...</p>
          ) : spaces.length === 0 ? (
            <p style={{ color: theme.textSec, fontSize: '14px' }}>No parking spaces have been mapped via GeoJSON yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {spaces.map(s => (
                <div key={s._id} style={{ padding: '15px', border: `1px solid ${theme.border}`, borderRadius: '12px', background: '#FAFAFA' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: theme.textMain }}>{s.spaceNumber}</h4>
                    <span style={{ fontSize: '12px', background: '#E2E8F0', padding: '4px 8px', borderRadius: '6px', fontWeight: '500', color: '#475569' }}>
                      {s.vehicleNumber || 'Unassigned'}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '14px', color: theme.textSec }}>
                    Allocated to: {s.allocatedTo?.name || 'Vacant'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartParking;
