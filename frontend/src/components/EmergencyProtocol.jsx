import React, { useState } from 'react';
import api from '../api';
import theme from '../theme';
import { toast } from 'sonner';
import { AlertTriangle, MapPin, Radio, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const EmergencyProtocol = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emergencyType, setEmergencyType] = useState('FIRE');
  const [severity, setSeverity] = useState('HIGH');
  const [message, setMessage] = useState('');
  const [useGeofence, setUseGeofence] = useState(false);
  const [zone, setZone] = useState('[\n  [77.500, 12.900],\n  [77.501, 12.900],\n  [77.501, 12.901],\n  [77.500, 12.901],\n  [77.500, 12.900]\n]');

  const handleTrigger = async (e) => {
    e.preventDefault();
    if (!message) {
      toast.error('Please provide an emergency message.');
      return;
    }

    setIsSubmitting(true);
    let parsedZone = [];
    if (useGeofence) {
      try {
        parsedZone = JSON.parse(zone);
      } catch (err) {
        toast.error('Invalid GeoJSON coordinates format.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const res = await api.post('/emergency/trigger', {
        emergencyType,
        severity,
        message,
        dangerZoneCoordinates: useGeofence ? parsedZone : []
      });
      
      toast.success(`Emergency protocol activated! Alerted ${res.data.affectedCount} residents.`);
      // Reset
      setMessage('');
      setEmergencyType('FIRE');
      setSeverity('HIGH');
    } catch (error) {
      toast.error('Failed to trigger emergency protocol');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px' }}>
        <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} style={{ background: '#FEF2F2', padding: '10px', borderRadius: '12px' }}>
          <AlertTriangle size={24} color="#DC2626" />
        </motion.div>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
          Emergency Operations Center
        </h3>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '350px', background: 'white', borderRadius: '24px', padding: '30px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={20} color="#DC2626" /> Trigger Evacuation Protocol
          </h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: theme.textSec }}>
            Activate this protocol to immediately dispatch automated Twilio voice calls and WhatsApp alerts to residents.
          </p>

          <form onSubmit={handleTrigger} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: theme.textSec }}>Emergency Type</label>
                <select value={emergencyType} onChange={(e) => setEmergencyType(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: '#F9F8F3', outline: 'none', fontFamily: "'Outfit', sans-serif" }}>
                  <option value="FIRE">Fire / Smoke Detected</option>
                  <option value="SECURITY">Security Breach / Intruder</option>
                  <option value="MEDICAL">Mass Medical Emergency</option>
                  <option value="STRUCTURAL">Structural Integrity Warning</option>
                  <option value="WEATHER">Severe Weather Alert</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: theme.textSec }}>Severity Level</label>
                <select value={severity} onChange={(e) => setSeverity(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: '#F9F8F3', outline: 'none', fontFamily: "'Outfit', sans-serif" }}>
                  <option value="CRITICAL">CRITICAL (Twilio Voice Call + WhatsApp)</option>
                  <option value="HIGH">HIGH (WhatsApp Alert Only)</option>
                  <option value="MODERATE">MODERATE (App Push Notification)</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: theme.textSec }}>Alert Message Instructions</label>
              <textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                required 
                placeholder="e.g. Please evacuate Block A immediately using the South stairwell. Do not use elevators."
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: '#F9F8F3', outline: 'none', fontFamily: "'Outfit', sans-serif", minHeight: '80px', resize: 'vertical' }} 
              />
            </div>

            <div style={{ padding: '15px', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: '600', color: theme.textMain, cursor: 'pointer' }}>
                <input type="checkbox" checked={useGeofence} onChange={(e) => setUseGeofence(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                Target Specific Danger Zone (Geofence)
              </label>
              
              {useGeofence && (
                <div style={{ marginTop: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '13px', fontWeight: '500', color: theme.textSec }}>
                    <MapPin size={14} /> Polygon Coordinates (JSON Array)
                  </label>
                  <textarea 
                    value={zone} 
                    onChange={(e) => setZone(e.target.value)} 
                    style={{ width: '100%', padding: '12px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: 'white', outline: 'none', fontFamily: 'monospace', minHeight: '120px', resize: 'vertical', fontSize: '12px' }} 
                  />
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748B' }}>Only residents within this polygon will receive the alert.</p>
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              style={{ padding: '16px', background: '#DC2626', color: 'white', border: 'none', borderRadius: '12px', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s', opacity: isSubmitting ? 0.7 : 1 }}
              onMouseOver={(e) => !isSubmitting && (e.currentTarget.style.background = '#B91C1C')}
              onMouseOut={(e) => !isSubmitting && (e.currentTarget.style.background = '#DC2626')}
            >
              <Radio size={20} />
              {isSubmitting ? 'DISPATCHING ALERTS...' : 'DISPATCH EMERGENCY ALERT NOW'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmergencyProtocol;
