import React, { useState, useEffect, useContext } from 'react';
import api from '../../api';
import theme from '../../theme';
import AuthContext from '../../context/AuthContext';
import { Droplets, Zap, Sun, AlertTriangle, Plus, BatteryCharging, Leaf, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const GreenSustainability = () => {
  const { user } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTankerModal, setShowTankerModal] = useState(false);

  // Tanker form
  const [vendor, setVendor] = useState('AquaFlow Express');
  const [capacityLiters, setCapacityLiters] = useState(10000);
  const [cost, setCost] = useState(1800);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/sustainability/metrics');
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load sustainability metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateLevel = async (tankName, newPercent) => {
    try {
      await api.post('/sustainability/tanks/update', {
        tankName,
        levelPercent: newPercent
      });
      toast.success(`${tankName} level calibrated to ${newPercent}%`);
      fetchData();
    } catch (err) {
      toast.error('Failed to update tank level');
    }
  };

  const handleLogTanker = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sustainability/tankers', { vendor, capacityLiters, cost });
      toast.success('Water tanker delivery logged!');
      setShowTankerModal(false);
      fetchData();
    } catch (err) {
      toast.error('Failed to log tanker');
    }
  };

  const handleToggleEV = async (station) => {
    try {
      if (station.status === 'Available') {
        await api.post('/sustainability/ev/start', { stationId: station.stationId });
        toast.success(`EV Charging started on ${station.name}`);
      } else {
        await api.post('/sustainability/ev/stop', { stationId: station.stationId, kwhConsumed: 18.5 });
        toast.success(`Session ended! Cost appended to your maintenance ledger.`);
      }
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'EV station action failed');
    }
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: theme.textSec }}>Loading green ERP...</div>;
  }

  const latestSolar = data?.solarMetrics?.[0] || { generationKwh: 140, gridExportKwh: 40, savingsAmount: 1200, co2OffsetKg: 114 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
            Green Society & Sustainability ERP
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.textSec }}>
            Ultrasonic water tank telemetry, EV station sub-metering, and solar grid analytics
          </p>
        </div>

        {(user.role === 'admin' || user.role === 'superadmin') && (
          <button
            onClick={() => setShowTankerModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px', background: '#0284C7', color: 'white',
              border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2,132,199,0.25)'
            }}
          >
            <Truck size={16} /> Log Water Tanker Delivery
          </button>
        )}
      </div>

      {/* SECTION 1: WATER TANKS */}
      <div>
        <h4 style={{ margin: '0 0 16px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Droplets size={22} color="#0284C7" /> Water Sump & Borewell Ultrasonic Levels
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          {data?.tanks?.map((tank, i) => (
            <div
              key={i}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '24px',
                border: `1px solid ${theme.border}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px',
                  background: tank.status === 'Critical' ? '#FEF2F2' : tank.status === 'Low' ? '#FFF7ED' : '#F0F9FF',
                  color: tank.status === 'Critical' ? '#DC2626' : tank.status === 'Low' ? '#EA580C' : '#0284C7' }}>
                  {tank.status} Level
                </span>
                <span style={{ fontSize: '12px', color: theme.textSec }}>
                  Cap: {tank.capacityLiters.toLocaleString()} L
                </span>
              </div>

              <div>
                <h5 style={{ margin: '0 0 4px 0', fontSize: '18px', color: theme.textMain }}>{tank.name}</h5>
                <div style={{ fontSize: '32px', fontWeight: '700', color: tank.currentLevelPercent < 25 ? '#DC2626' : '#0284C7' }}>
                  {tank.currentLevelPercent}%
                </div>
              </div>

              {/* Animated water gauge cylinder */}
              <div style={{
                height: '14px',
                width: '100%',
                background: '#E0F2FE',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${tank.currentLevelPercent}%` }}
                  transition={{ duration: 1 }}
                  style={{
                    height: '100%',
                    background: tank.currentLevelPercent < 25 ? '#DC2626' : 'linear-gradient(90deg, #38BDF8 0%, #0284C7 100%)',
                    borderRadius: '8px'
                  }}
                />
              </div>

              {/* Simulation Quick Sliders for Testing */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button
                  onClick={() => handleUpdateLevel(tank.name, 15)}
                  style={{ flex: 1, padding: '6px', fontSize: '11px', background: '#FEF2F2', color: '#DC2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Simulate Low (15%)
                </button>
                <button
                  onClick={() => handleUpdateLevel(tank.name, 85)}
                  style={{ flex: 1, padding: '6px', fontSize: '11px', background: '#F0F9FF', color: '#0284C7', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                  Simulate Full (85%)
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: EV CHARGING STATIONS */}
      <div>
        <h4 style={{ margin: '0 0 16px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={22} color="#16A34A" /> EV Charging Station Sub-Metering
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {data?.evStations?.map((station) => (
            <div
              key={station.stationId}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '24px',
                border: `1px solid ${theme.border}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px',
                    background: station.status === 'Available' ? '#ECFDF5' : '#FEF2F2',
                    color: station.status === 'Available' ? '#059669' : '#DC2626'
                  }}>
                    {station.status}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: theme.textMain }}>
                    ₹{station.ratePerKwh}/kWh
                  </span>
                </div>

                <h5 style={{ margin: '0 0 4px 0', fontSize: '18px', color: theme.textMain }}>
                  {station.name}
                </h5>
                <p style={{ margin: 0, fontSize: '13px', color: theme.textSec }}>
                  Total Delivered: <strong>{station.totalKwhDelivered} kWh</strong>
                </p>
              </div>

              <button
                onClick={() => handleToggleEV(station)}
                style={{
                  padding: '12px',
                  background: station.status === 'Available' ? '#16A34A' : '#DC2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {station.status === 'Available' ? 'Plug In & Start Charging' : 'Stop Session & Bill Flat'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 3: SOLAR ROOFTOP GENERATION */}
      <div>
        <h4 style={{ margin: '0 0 16px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sun size={22} color="#EA580C" /> Common-Area Solar Rooftop Inverter
        </h4>

        <div style={{
          background: 'linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%)',
          borderRadius: '24px',
          padding: '26px 30px',
          border: '1px solid #FED7AA',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div>
            <span style={{ fontSize: '12px', color: '#9A3412', textTransform: 'uppercase', fontWeight: '700' }}>Today's Generation</span>
            <div style={{ fontSize: '26px', fontWeight: '700', color: '#7C2D12', marginTop: '4px' }}>
              {latestSolar.generationKwh} kWh
            </div>
            <span style={{ fontSize: '12px', color: '#9A3412' }}>Exported: {latestSolar.gridExportKwh} kWh</span>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: '#9A3412', textTransform: 'uppercase', fontWeight: '700' }}>Cost Savings</span>
            <div style={{ fontSize: '26px', fontWeight: '700', color: '#047857', marginTop: '4px' }}>
              ₹{latestSolar.savingsAmount.toLocaleString()}
            </div>
            <span style={{ fontSize: '12px', color: '#047857' }}>Saved against grid tariff</span>
          </div>

          <div>
            <span style={{ fontSize: '12px', color: '#9A3412', textTransform: 'uppercase', fontWeight: '700' }}>Carbon Offset</span>
            <div style={{ fontSize: '26px', fontWeight: '700', color: '#059669', marginTop: '4px' }}>
              {latestSolar.co2OffsetKg} kg CO₂
            </div>
            <span style={{ fontSize: '12px', color: '#059669' }}>Equivalent to 6 trees planted</span>
          </div>
        </div>
      </div>

      {/* Tanker Log Modal */}
      <AnimatePresence>
        {showTankerModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'white', borderRadius: '24px', padding: '30px', maxWidth: '420px', width: '100%', border: `1px solid ${theme.border}` }}>
              <h3 style={{ margin: '0 0 20px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain }}>
                Log Water Tanker Delivery
              </h3>
              <form onSubmit={handleLogTanker} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Vendor Agency</label>
                  <input type="text" value={vendor} onChange={(e) => setVendor(e.target.value)} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Capacity (Liters)</label>
                  <input type="number" min={1000} value={capacityLiters} onChange={(e) => setCapacityLiters(Number(e.target.value))} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Cost Paid (₹)</label>
                  <input type="number" min={0} value={cost} onChange={(e) => setCost(Number(e.target.value))} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowTankerModal(false)}
                    style={{ flex: 1, padding: '12px', background: '#F3F4F6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit"
                    style={{ flex: 1, padding: '12px', background: '#0284C7', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Save Delivery Log
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GreenSustainability;
