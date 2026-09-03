import React, { useState, useEffect, useContext } from 'react';
import api from '../../api';
import theme from '../../theme';
import AuthContext from '../../context/AuthContext';
import { ShoppingBag, Car, Tag, Plus, Phone, MapPin, Clock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const CommunityClassifieds = () => {
  const { user } = useContext(AuthContext);
  const [classifieds, setClassifieds] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);

  // Form State
  const [category, setCategory] = useState('Sell');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [contactPhone, setContactPhone] = useState(user.phone || '');
  // Carpool fields
  const [origin, setOrigin] = useState('Gulmohar Society Main Gate');
  const [destination, setDestination] = useState('');
  const [departureTime, setDepartureTime] = useState('08:30 AM');
  const [seatsAvailable, setSeatsAvailable] = useState(2);

  const fetchClassifieds = async () => {
    try {
      setLoading(true);
      const url = categoryFilter === 'All' ? '/lifestyle/classifieds' : `/lifestyle/classifieds?category=${categoryFilter}`;
      const { data } = await api.get(url);
      setClassifieds(data);
    } catch (err) {
      toast.error('Failed to load classifieds');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassifieds();
  }, [categoryFilter]);

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        category,
        title,
        description,
        price,
        contactPhone,
        carpool: category === 'Carpool' ? {
          origin,
          destination,
          departureTime,
          seatsAvailable
        } : undefined
      };

      await api.post('/lifestyle/classifieds', payload);
      toast.success('Listing published to society board!');
      setShowPostModal(false);
      setTitle('');
      setDescription('');
      fetchClassifieds();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post listing');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', width: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
            Resident Classifieds & Carpooling
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: theme.textSec }}>
            Community buy/sell, home rentals, and daily office commute carpooling
          </p>
        </div>

        <button
          onClick={() => setShowPostModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', background: theme.accent, color: 'white',
            border: 'none', borderRadius: '12px', fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(217,115,78,0.25)'
          }}
        >
          <Plus size={18} /> Post New Listing
        </button>
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {['All', 'Sell', 'Rent', 'Carpool', 'Services'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            style={{
              padding: '8px 18px',
              borderRadius: '20px',
              background: categoryFilter === cat ? theme.textMain : 'white',
              color: categoryFilter === cat ? 'white' : theme.textSec,
              fontWeight: '600',
              fontSize: '13px',
              cursor: 'pointer',
              border: `1px solid ${categoryFilter === cat ? theme.textMain : theme.border}`
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: theme.textSec }}>Loading community board...</div>
      ) : classifieds.length === 0 ? (
        <div style={{ background: 'white', borderRadius: '20px', padding: '40px', textAlign: 'center', border: `1px solid ${theme.border}` }}>
          <Tag size={48} color={theme.accent} style={{ opacity: 0.4, marginBottom: '12px' }} />
          <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', color: theme.textMain }}>No listings found</h4>
          <p style={{ margin: 0, fontSize: '14px', color: theme.textSec }}>Be the first neighbor to post a classified or offer a carpool ride!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {classifieds.map((item) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'white',
                borderRadius: '20px',
                padding: '24px',
                border: `1px solid ${theme.border}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    fontSize: '12px', fontWeight: '700', padding: '4px 10px', borderRadius: '12px',
                    background: item.category === 'Carpool' ? '#ECFDF5' : '#FFF7ED',
                    color: item.category === 'Carpool' ? '#059669' : '#EA580C'
                  }}>
                    {item.category === 'Carpool' ? <Car size={14} /> : <Tag size={14} />} {item.category}
                  </span>

                  {item.price > 0 && (
                    <span style={{ fontSize: '16px', fontWeight: '700', color: theme.textMain }}>
                      ₹{item.price.toLocaleString()}
                    </span>
                  )}
                </div>

                <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '600', color: theme.textMain }}>
                  {item.title}
                </h4>
                <p style={{ margin: '0 0 14px 0', fontSize: '14px', color: theme.textSec, lineHeight: '1.5' }}>
                  {item.description}
                </p>

                {item.category === 'Carpool' && item.carpool && (
                  <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.textMain }}>
                      <MapPin size={14} color="#059669" /> <strong>To:</strong> {item.carpool.destination}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: theme.textSec }}>
                      <Clock size={14} /> {item.carpool.departureTime} • {item.carpool.seatsAvailable} seat(s) available
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                paddingTop: '12px', borderTop: `1px solid ${theme.border}`
              }}>
                <div style={{ fontSize: '12px', color: theme.textSec }}>
                  Posted by: <strong>{item.authorId?.name || 'Resident'}</strong> ({item.authorId?.wing}-{item.authorId?.flatNumber})
                </div>

                <a
                  href={`tel:${item.contactPhone}`}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '8px 14px', background: '#0F172A', color: 'white',
                    borderRadius: '8px', fontSize: '12px', fontWeight: '600', textDecoration: 'none'
                  }}
                >
                  <Phone size={14} /> Call
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      <AnimatePresence>
        {showPostModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              style={{ background: 'white', borderRadius: '24px', padding: '30px', maxWidth: '480px', width: '100%', border: `1px solid ${theme.border}`, maxHeight: '90vh', overflowY: 'auto' }}>
              <h3 style={{ margin: '0 0 20px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', color: theme.textMain }}>
                Post Classified / Carpool
              </h3>
              <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }}>
                    <option value="Sell">Sell Used Item (Furniture, Electronics)</option>
                    <option value="Rent">Rent Property / Flat / Parking Spot</option>
                    <option value="Carpool">Daily Carpool / Ride Share</option>
                    <option value="Services">Local Services (Tuition, Yoga, Cooking)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Title</label>
                  <input type="text" placeholder={category === 'Carpool' ? 'e.g. Daily Ride to BKC' : 'e.g. Solid Oak Dining Table'} value={title} onChange={(e) => setTitle(e.target.value)} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Description</label>
                  <textarea rows={3} placeholder="Details, condition, timings..." value={description} onChange={(e) => setDescription(e.target.value)} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                {category !== 'Carpool' ? (
                  <div>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Price (₹)</label>
                    <input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))}
                      style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Destination Hub</label>
                        <input type="text" placeholder="e.g. Cyber City" value={destination} onChange={(e) => setDestination(e.target.value)} required
                          style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Departure Time</label>
                        <input type="text" placeholder="e.g. 08:30 AM" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required
                          style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Seats Available</label>
                      <input type="number" min={1} max={6} value={seatsAvailable} onChange={(e) => setSeatsAvailable(Number(e.target.value))} required
                        style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                    </div>
                  </>
                )}

                <div>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: theme.textSec }}>Contact Phone</label>
                  <input type="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} required
                    style={{ width: '100%', padding: '10px', borderRadius: '10px', border: `1px solid ${theme.border}`, marginTop: '4px' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setShowPostModal(false)}
                    style={{ flex: 1, padding: '12px', background: '#F3F4F6', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button type="submit"
                    style={{ flex: 1, padding: '12px', background: theme.accent, color: 'white', border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer' }}>
                    Publish Listing
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

export default CommunityClassifieds;
