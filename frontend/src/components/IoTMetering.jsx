import React, { useState } from 'react';
import api from '../api';
import theme from '../theme';
import { toast } from 'sonner';
import { Cpu, Zap, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const IoTMetering = () => {
  const [isPolling, setIsPolling] = useState(false);
  const [pollResult, setPollResult] = useState(null);

  const handlePoll = async () => {
    setIsPolling(true);
    setPollResult(null);
    try {
      const res = await api.post('/iot/poll');
      setPollResult(res.data);
      toast.success(`Successfully polled ${res.data.metersScanned} smart meters.`);
    } catch (error) {
      toast.error('Failed to poll IoT meters.');
    } finally {
      setIsPolling(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: 'linear' }} style={{ background: '#ECFEFF', padding: '10px', borderRadius: '12px' }}>
          <Cpu size={24} color="#0891B2" />
        </motion.div>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
          IoT Smart Metering
        </h3>
      </div>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '350px', background: 'white', borderRadius: '24px', padding: '30px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontFamily: "'Outfit', sans-serif", margin: '0 0 20px 0', fontSize: '20px', fontWeight: '600', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity size={20} color="#0891B2" /> Real-time Anomaly Detection
          </h3>
          <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: theme.textSec }}>
            Poll standard IoT APIs (water/electricity meters) across the society. Automatically detect massive spikes (e.g., hidden leaks) and dispatch instant resident alerts.
          </p>

          <button 
            onClick={handlePoll}
            disabled={isPolling}
            style={{ width: '100%', padding: '16px', background: '#0891B2', color: 'white', border: 'none', borderRadius: '12px', cursor: isPolling ? 'wait' : 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s', opacity: isPolling ? 0.7 : 1 }}
            onMouseOver={(e) => !isPolling && (e.currentTarget.style.background = '#0E7490')}
            onMouseOut={(e) => !isPolling && (e.currentTarget.style.background = '#0891B2')}
          >
            <Zap size={20} />
            {isPolling ? 'POLLING METER CLUSTER...' : 'MANUALLY RUN CRON JOB'}
          </button>

          {pollResult && (
            <div style={{ marginTop: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textSec }}>Meters Scanned: <span style={{ color: theme.textMain }}>{pollResult.metersScanned}</span></span>
                <span style={{ fontSize: '14px', fontWeight: '600', color: theme.textSec }}>Anomalies Found: <span style={{ color: pollResult.anomaliesDetected.length > 0 ? '#DC2626' : '#16A34A' }}>{pollResult.anomaliesDetected.length}</span></span>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pollResult.anomaliesDetected.map((anomaly, idx) => (
                  <div key={idx} style={{ padding: '15px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#991B1B' }}>{anomaly.resident}</span>
                      <span style={{ fontSize: '12px', fontWeight: '600', background: '#DC2626', color: 'white', padding: '2px 8px', borderRadius: '10px' }}>ALERT DISPATCHED</span>
                    </div>
                    <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#7F1D1D' }}>
                      <span><strong>Electric:</strong> {anomaly.usage.electricityUsage.toFixed(1)} kWh</span>
                      <span><strong>Water:</strong> {anomaly.usage.waterUsage.toFixed(1)} L</span>
                    </div>
                  </div>
                ))}
                {pollResult.anomaliesDetected.length === 0 && (
                  <div style={{ padding: '15px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: '12px', textAlign: 'center', color: '#16A34A', fontSize: '14px', fontWeight: '500' }}>
                    All parameters normal. No spikes detected.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IoTMetering;
