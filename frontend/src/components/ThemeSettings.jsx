import React, { useState, useEffect } from 'react';
import api from '../api';
import theme from '../theme';
import { toast } from 'sonner';
import { Palette, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeSettings = () => {
  const [accentColor, setAccentColor] = useState('#D9734E');
  const [bgColor, setBgColor] = useState('#F9F8F3');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const { data } = await api.get('/theme');
        if (data.themeConfig) {
          setAccentColor(data.themeConfig.accentColor || '#D9734E');
          setBgColor(data.themeConfig.bg || '#F9F8F3');
        }
      } catch (err) {
        console.error('Failed to load theme settings');
      }
    };
    fetchTheme();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.put('/theme', { accentColor, bg: bgColor });
      
      // Instantly apply to DOM
      document.documentElement.style.setProperty('--theme-accent', accentColor);
      document.documentElement.style.setProperty('--theme-bg', bgColor);
      
      toast.success('White-label theme updated successfully.');
    } catch (error) {
      toast.error('Failed to update theme.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 10, ease: 'linear' }} style={{ background: '#FFF7ED', padding: '10px', borderRadius: '12px' }}>
          <Palette size={24} color="#EA580C" />
        </motion.div>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
          Enterprise White-Labeling
        </h3>
      </div>

      <div style={{ background: 'white', borderRadius: '24px', padding: '30px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: theme.textMain }}>Primary Accent Color</label>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <input 
                type="color" 
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                style={{ width: '50px', height: '50px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }}
              />
              <input 
                type="text" 
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, fontSize: '15px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <label style={{ fontSize: '14px', fontWeight: '600', color: theme.textMain }}>Background Color</label>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              <input 
                type="color" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ width: '50px', height: '50px', border: 'none', borderRadius: '8px', cursor: 'pointer', padding: 0 }}
              />
              <input 
                type="text" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                style={{ flex: 1, padding: '14px', borderRadius: '10px', border: `1px solid ${theme.border}`, fontSize: '15px' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSaving}
            style={{ marginTop: '10px', width: '100%', padding: '16px', background: theme.accent, color: 'white', border: 'none', borderRadius: '12px', cursor: isSaving ? 'wait' : 'pointer', fontFamily: "'Outfit', sans-serif", fontWeight: '700', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', transition: 'all 0.2s', opacity: isSaving ? 0.7 : 1 }}
          >
            <Save size={20} />
            {isSaving ? 'APPLYING...' : 'APPLY THEME GLOBALLY'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ThemeSettings;
