import React, { useState, useEffect } from 'react';
import api from '../api';
import theme from '../theme';
import { Tag, MapPin, ExternalLink, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const LocalOffers = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAds = async () => {
      try {
        const { data } = await api.get('/ads');
        setAds(data);
      } catch (error) {
        console.error('Error fetching ads', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 15, ease: 'linear' }} style={{ background: '#FCE7F3', padding: '10px', borderRadius: '12px' }}>
          <Tag size={24} color="#DB2777" />
        </motion.div>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
          Local Offers & Services
        </h3>
      </div>

      <p style={{ margin: '0 10px 10px', fontSize: '15px', color: theme.textSec }}>
        Exclusive hyper-local deals and services from verified neighborhood vendors.
      </p>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: theme.textSec }}>Loading offers...</div>
      ) : ads.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: 'white', borderRadius: '24px', border: `1px solid ${theme.border}`, color: theme.textSec }}>
          No local offers available at the moment.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', padding: '0 10px' }}>
          {ads.map((ad, idx) => (
            <motion.div 
              key={ad._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              style={{ background: 'white', borderRadius: '20px', border: `1px solid ${theme.border}`, overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', position: 'relative' }}
            >
              {idx === 0 && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', background: '#FEF3C7', color: '#B45309', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Sparkles size={12} /> TOP SPONSOR
                </div>
              )}
              
              <div style={{ height: '140px', background: ad.imageUrl ? `url(${ad.imageUrl}) center/cover` : 'linear-gradient(135deg, #FDF2F8 0%, #FCE7F3 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {!ad.imageUrl && <Tag size={40} color="#F9A8D4" opacity={0.5} />}
              </div>
              
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '18px', fontWeight: '700', color: theme.textMain }}>{ad.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: theme.textSec, marginBottom: '15px', fontWeight: '500' }}>
                  <MapPin size={14} /> {ad.vendorName}
                </div>
                
                <p style={{ margin: '0 0 20px 0', fontSize: '14px', color: theme.textSec, flex: 1, lineHeight: '1.5' }}>
                  {ad.description}
                </p>

                {ad.contactUrl ? (
                  <a href={ad.contactUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '12px', background: theme.accent, color: 'white', textDecoration: 'none', borderRadius: '10px', textAlign: 'center', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'transform 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    View Offer <ExternalLink size={16} />
                  </a>
                ) : (
                  <div style={{ padding: '12px', background: '#F1F5F9', color: '#64748B', borderRadius: '10px', textAlign: 'center', fontWeight: '600', fontSize: '14px' }}>
                    Walk-in Only
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocalOffers;
