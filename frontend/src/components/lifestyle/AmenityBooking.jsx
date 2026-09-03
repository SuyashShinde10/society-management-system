import React, { useState, useEffect, useContext } from 'react';
import api from '../../api';
import theme from '../../theme';
import AuthContext from '../../context/AuthContext';
import { Calendar, Clock, Users, Plus, CheckCircle, Sparkles, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const AmenityBooking = () => {
  const { user } = useContext(AuthContext);
  const [amenities, setAmenities] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [selectedAmenity, setSelectedAmenity] = useState(null);
  const [bookingDate, setBookingDate] = useState(new Date().toISOString().split('T')[0]);
  const [slotTime, setSlotTime] = useState('07:00 - 08:00');
  const [peopleCount, setPeopleCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Admin Add Amenity Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(10);
  const [pricePerSlot, setPricePerSlot] = useState(0);
  const [rules, setRules] = useState('');

  const slots = [
    '06:00 - 07:00', '07:00 - 08:00', '08:00 - 09:00',
    '09:00 - 10:00', '16:00 - 17:00', '17:00 - 18:00',
    '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00'
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [amenitiesRes, bookingsRes] = await Promise.all([
        api.get('/lifestyle/amenities'),
        api.get('/lifestyle/amenities/bookings')
      ]);
      setAmenities(amenitiesRes.data);
      setMyBookings(bookingsRes.data);
    } catch (err) {
      toast.error('Failed to load amenities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedAmenity) return;
    setSubmitting(true);
    try {
      await api.post('/lifestyle/amenities/book', {
        amenityId: selectedAmenity._id,
        date: bookingDate,
        slotTime,
        numberOfPeople: peopleCount
      });
      toast.success('Amenity slot booked successfully!');
      setSelectedAmenity(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to book slot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAmenity = async (e) => {
    e.preventDefault();
    try {
      await api.post('/lifestyle/amenities', {
        name,
        description,
        capacity,
        pricePerSlot,
        rules
      });
      toast.success('Amenity added to society catalog!');
      setShowAddModal(false);
      setName('');
      setDescription('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add amenity');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
            Amenity Booking & Capacity Limits
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.textSec }}>
            Reserve clubhouse, swimming pool, tennis court, and banquet slots
          </p>
        </div>

        {(user.role === 'admin' || user.role === 'superadmin') && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', background: theme.accent, color: 'white',
              border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(217,115,78,0.25)'
            }}
          >
            <Plus size={18} /> Add New Facility
          </button>
        )}
      </div>

      {/* Facilities Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: theme.textSec }}>Loading facilities...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {amenities.map((amenity) => (
            <motion.div
              key={amenity._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'white',
                borderRadius: '24px',
                padding: '24px',
                border: `1px solid ${theme.border}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
                gap: '16px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{
                    fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px',
                    background: '#EFF6FF', color: '#1D4ED8'
                  }}>
                    Max {amenity.capacity} people/slot
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: amenity.pricePerSlot > 0 ? theme.textMain : '#059669' }}>
                    {amenity.pricePerSlot > 0 ? `₹${amenity.pricePerSlot} / slot` : 'Free'}
                  </span>
                </div>

                <h4 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '600', color: theme.textMain }}>
                  {amenity.name}
                </h4>
                <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: theme.textSec, lineHeight: '1.5' }}>
                  {amenity.description || 'Modern society amenity open for all verified residents.'}
                </p>

                {amenity.rules && (
                  <div style={{ fontSize: '12px', color: theme.textSec, background: '#F9F8F3', padding: '8px 12px', borderRadius: '8px' }}>
                    Rule: {amenity.rules}
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedAmenity(amenity)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: theme.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(217,115,78,0.2)'
                }}
              >
                Reserve Slot
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* My Bookings Section */}
      {myBookings.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ margin: '0 0 16px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain }}>
            Active Slot Reservations
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
            {myBookings.map((b) => (
              <div key={b._id} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '16px 20px',
                border: `1px solid ${theme.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <h5 style={{ margin: '0 0 4px 0', fontSize: '16px', color: theme.textMain }}>{b.amenityId?.name || 'Facility'}</h5>
                  <p style={{ margin: 0, fontSize: '13px', color: theme.textSec }}>
                    {b.date} • {b.slotTime} ({b.numberOfPeople} person)
                  </p>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px', background: '#ECFDF5', color: '#059669' }}>
                  Confirmed
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedAmenity && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'white', borderRadius: '24px', padding: '30px', maxWidth: '450px', width: '100%', border: `1px solid ${theme.border}` }}>
              <h3 style={{ margin: '0 0 6px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain }}>
                Book {selectedAmenity.name}
              </h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: theme.textSec }}>
                Capacity: {selectedAmenity.capacity} persons per slot • Price: {selectedAmenity.pricePerSlot > 0 ? `₹${selectedAmenity.pricePerSlot}` : 'Free'}
              </p>

              <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Date</label>
                  <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} required
                    min={new Date().toISOString().split('T')[0]}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Time Slot</label>
                  <select value={slotTime} onChange={(e) => setSlotTime(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }}>
                    {slots.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Number of Attendees</label>
                  <input type="number" min={1} max={selectedAmenity.capacity} value={peopleCount} onChange={(e) => setPeopleCount(Number(e.target.value))} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setSelectedAmenity(null)}
                    style={{ flex: 1, padding: '12px', background: '#F3F4F6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    style={{ flex: 1, padding: '12px', background: theme.accent, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    {submitting ? 'Confirming...' : 'Confirm Reservation'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Amenity Modal (Admin) */}
      <AnimatePresence>
        {showAddModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'white', borderRadius: '24px', padding: '30px', maxWidth: '450px', width: '100%', border: `1px solid ${theme.border}` }}>
              <h3 style={{ margin: '0 0 20px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain }}>
                Add Society Facility
              </h3>
              <form onSubmit={handleCreateAmenity} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Facility Name</label>
                  <input type="text" placeholder="e.g. Swimming Pool" value={name} onChange={(e) => setName(e.target.value)} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Description</label>
                  <input type="text" placeholder="e.g. Olympic-sized pool with lifeguard" value={description} onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Max Capacity</label>
                    <input type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Price (₹ / slot)</label>
                    <input type="number" min={0} value={pricePerSlot} onChange={(e) => setPricePerSlot(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Rules / Policies</label>
                  <input type="text" placeholder="e.g. Proper swimwear required" value={rules} onChange={(e) => setRules(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowAddModal(false)}
                    style={{ flex: 1, padding: '12px', background: '#F3F4F6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit"
                    style={{ flex: 1, padding: '12px', background: theme.accent, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Create Facility
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

export default AmenityBooking;
