import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, FileText, CreditCard, Heart, Users, Activity, UserPlus, Settings, CheckCircle } from 'lucide-react';

// --- DOODLES ---

const SquiggleDoodle = ({ style }) => (
  <svg width="120" height="20" viewBox="0 0 120 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={style || { position: 'absolute', bottom: '-10px', left: '0' }}>
    <motion.path d="M2 10C15 -5 25 25 40 10C55 -5 65 25 80 10C95 -5 105 25 118 10" stroke="#D9734E" strokeWidth="3" strokeLinecap="round" 
      initial={{ pathLength: 0, opacity: 0 }} whileInView={{ pathLength: 1, opacity: 1 }} viewport={{ once: true }} transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }} />
  </svg>
);

const ArrowDoodle = ({ style }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={style || { position: 'absolute', top: '-15px', right: '-45px', transform: 'rotate(15deg)' }}>
    <motion.path d="M5 35 Q 20 10 35 15 M 25 5 L 35 15 L 25 25" stroke="#6B705C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 1 }} />
  </svg>
);

const StarburstDoodle = ({ style }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" style={style || { position: 'absolute', top: '-20px', left: '-30px' }}>
    <motion.path d="M20 0L23 17L40 20L23 23L20 40L17 23L0 20L17 17L20 0Z" fill="#D9734E" 
      initial={{ scale: 0, rotate: -90 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 200, delay: 1.2 }} />
  </svg>
);

const SwirlDoodle = ({ style }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" style={style || { position: 'absolute', bottom: '-20px', right: '-20px' }}>
    <motion.path d="M30 5C45 5 55 15 55 30C55 45 45 55 30 55C15 55 5 45 5 30C5 20 15 15 25 20C35 25 30 40 20 35" stroke="#D9734E" strokeWidth="2" strokeLinecap="round" fill="transparent"
      initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2, ease: "easeOut" }} />
  </svg>
);

const HighlightDoodle = ({ children }) => (
  <span style={{ position: 'relative', display: 'inline-block' }}>
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, zIndex: -1, overflow: 'visible' }}>
      <motion.path d="M-5 80 Q 50 20 105 80" vectorEffect="non-scaling-stroke" stroke="#E8E4D9" strokeWidth="12" strokeLinecap="round" fill="none"
        initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} />
    </svg>
    {children}
  </span>
);

const AnimatedText = ({ text }) => {
  const words = text.split(" ");
  return (
    <motion.div style={{ display: "inline-flex", flexWrap: "wrap", justifyContent: "center" }} 
      initial="hidden" whileInView="visible" viewport={{ once: true }}
      variants={{ visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } }, hidden: {} }}>
      {words.map((word, index) => (
        <motion.span key={index} style={{ marginRight: "12px", paddingBottom: "10px" }}
          variants={{
            visible: { opacity: 1, y: 0, transition: { type: "spring", damping: 12, stiffness: 100 } },
            hidden: { opacity: 0, y: 20 }
          }}>
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

const BlobBackground = () => (
  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }}>
    <motion.div animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      style={{ position: 'absolute', top: '-10%', right: '-10%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(217,115,78,0.04) 0%, rgba(249,248,243,0) 70%)', borderRadius: '50%' }} />
    <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, -5, 5, 0] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      style={{ position: 'absolute', bottom: '20%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(107,112,92,0.05) 0%, rgba(249,248,243,0) 70%)', borderRadius: '50%' }} />
  </div>
);

// --- COMPONENT ---

const Home = () => {
  const theme = { bg: '#F9F8F3', surface: '#FFFDF9', textMain: '#2C2C2C', textSec: '#6B6B6B', border: '#E8E4D9', accent: '#D9734E', mutedOlive: '#6B705C' };

  return (
    <div style={{ backgroundColor: theme.bg, minHeight: '100vh', color: theme.textMain, width: '100%', overflowX: 'hidden', position: 'relative', fontFamily: "'Outfit', sans-serif" }}>
      <BlobBackground />
      
      {/* NAVIGATION */}
      <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="flex flex-wrap justify-between items-center px-6 md:px-[60px] py-6 relative z-10 gap-4">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="/awaastech-logo.png" alt="Awaastech" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
          <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: '600', letterSpacing: '1px' }}>Awaastech</h2>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <Link to="/login" style={{ textDecoration: 'none', color: theme.textSec, fontWeight: '500', fontSize: '15px', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = theme.accent} onMouseOut={e => e.target.style.color = theme.textSec}>Log In</Link>
          <Link to="/register" style={{ textDecoration: 'none', background: theme.textMain, color: 'white', padding: '8px 20px', borderRadius: '30px', fontWeight: '500', fontSize: '14px', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}>Get Started</Link>
        </div>
      </motion.nav>

      {/* HERO SECTION */}
      <header className="px-6 md:px-[60px] pt-[80px] pb-[100px] md:pt-[100px] md:pb-[140px] relative z-10 flex flex-col items-center text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ background: 'white', padding: '8px 20px', borderRadius: '20px', fontSize: '13px', fontWeight: '600', color: theme.mutedOlive, border: `1px solid ${theme.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', background: theme.accent, borderRadius: '50%', display: 'inline-block' }}></span>
            Introducing Society Management 2.0
          </div>

          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 'clamp(36px, 8vw, 85px)', fontWeight: '500', lineHeight: '1', margin: '0 0 30px 0', color: theme.textMain }}>
            <AnimatedText text="Living spaces," />
            <br/>
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }} style={{ position: 'relative', display: 'inline-block', fontStyle: 'italic', color: theme.accent }}>
              <StarburstDoodle /> beautifully managed. <SquiggleDoodle />
            </motion.span>
          </h1>

          <p style={{ fontSize: '18px', color: theme.textSec, lineHeight: '1.6', maxWidth: '600px', marginBottom: '50px', fontWeight: '300' }}>
            Awaastech brings harmony to housing societies with seamless communication, transparent financials, and effortless resident onboarding.
          </p>

          <div style={{ display: 'flex', gap: '20px', position: 'relative' }}>
            <Link to="/register" style={{ textDecoration: 'none', background: theme.accent, color: 'white', padding: '18px 40px', borderRadius: '40px', fontWeight: '500', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 8px 24px rgba(217, 115, 78, 0.25)', transition: 'transform 0.2s ease' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
              Start for free <ArrowRight size={18} />
            </Link>
            <ArrowDoodle />
          </div>
        </motion.div>
      </header>

      {/* FEATURES GRID */}
      <section id="features" className="px-6 md:px-[60px] pb-[80px] md:pb-[140px] relative z-10">
        <div style={{ textAlign: 'center', marginBottom: '60px', position: 'relative' }}>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: '600', color: theme.textMain, margin: '0 0 15px 0' }}>
            Core Platform Features
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontSize: '18px', color: theme.textSec, fontWeight: '300', margin: 0 }}>
            Everything you need to manage your society, all in one place.
          </motion.p>
        </div>
        <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8 }}
          style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          <FeatureCard 
            delay={0.1}
            doodle={<svg width="150" height="150" style={{position: 'absolute', top: '-50px', right: '-50px', opacity: 0.3}}><circle cx="75" cy="75" r="50" fill="none" stroke="#D9734E" strokeWidth="2" strokeDasharray="10 10"/></svg>}
            icon={<FileText size={28} color={theme.accent} />} 
            title="Notice Protocol" 
            desc="Instant dissemination of critical society updates and meeting minutes to all residents." 
          />
          <FeatureCard 
            delay={0.3}
            doodle={<svg width="100" height="100" style={{position: 'absolute', bottom: '-20px', left: '-20px', opacity: 0.3}}><rect x="20" y="20" width="60" height="60" rx="10" fill="none" stroke="#6B705C" strokeWidth="2" transform="rotate(15 50 50)"/></svg>}
            icon={<CreditCard size={28} color={theme.mutedOlive} />} 
            title="Financial Ledger" 
            desc="Automated audit trails for society spending and simple maintenance bill generation." 
          />
          <FeatureCard 
            delay={0.5}
            doodle={<svg width="120" height="120" style={{position: 'absolute', top: '10px', right: '-30px', opacity: 0.3}}><path d="M10 60 Q 60 10 110 60 T 210 60" fill="none" stroke="#4A90E2" strokeWidth="3"/></svg>}
            icon={<ShieldCheck size={28} color="#4A90E2" />} 
            title="Secure Ecosystem" 
            desc="Restricted access environment ensuring resident metadata is fully encrypted." 
          />
        </motion.div>
      </section>

      {/* WALKTHROUGH SECTION */}
      <section className="px-6 md:px-[60px] pb-[80px] md:pb-[140px] relative z-10">
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '80px', position: 'relative' }}>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
              style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: '600', color: theme.textMain, margin: '0 0 15px 0' }}>
              How it works
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }}
              style={{ fontSize: '18px', color: theme.textSec, fontWeight: '300', margin: 0 }}>
              Three simple steps to digitize your society.
            </motion.p>
            <StarburstDoodle style={{ position: 'absolute', top: '-10px', right: '20%', transform: 'scale(0.7)' }} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', position: 'relative' }}>
            {/* Dashed connector line */}
            <svg width="4" height="100%" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 0, opacity: 0.2 }}><line x1="2" y1="0" x2="2" y2="100%" stroke="#D9734E" strokeWidth="2" strokeDasharray="8 8" /></svg>
            
            {/* Step 1 */}
            <WalkthroughStep 
              number="1"
              icon={<Settings size={32} color={theme.accent} />}
              title="Set Up Your Society"
              desc="The admin registers the society, sets up the financial structure, and generates a secure society code."
              align="left"
              doodle={<SwirlDoodle style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.4 }} />}
            />
            
            {/* Step 2 */}
            <WalkthroughStep 
              number="2"
              icon={<UserPlus size={32} color={theme.mutedOlive} />}
              title="Onboard Residents"
              desc="Residents download the app, enter the society code, and are instantly connected to the digital ecosystem."
              align="right"
              doodle={<SquiggleDoodle style={{ position: 'absolute', bottom: '-15px', right: '0', opacity: 0.4 }} />}
            />

            {/* Step 3 */}
            <WalkthroughStep 
              number="3"
              icon={<CheckCircle size={32} color="#4A90E2" />}
              title="Manage Everything"
              desc="Collect maintenance, broadcast notices, and track visitor logs seamlessly from one intuitive dashboard."
              align="left"
              doodle={<ArrowDoodle style={{ position: 'absolute', top: '-15px', left: '-40px', opacity: 0.4, transform: 'rotate(130deg)' }} />}
            />
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about" className="px-6 md:px-[60px] py-[80px] md:py-[100px] relative z-10 bg-white" style={{ borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '60px' }}>
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ flex: 1, minWidth: '100%' }} className="md:min-w-[300px]">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '48px', fontWeight: '500', color: theme.textMain, margin: '0 0 20px 0' }}>
              We build <HighlightDoodle>communities,</HighlightDoodle> <br/> not just software.
            </h2>
            <p style={{ fontSize: '18px', color: theme.textSec, lineHeight: '1.8', fontWeight: '300', marginBottom: '30px' }}>
              Our mission is to eliminate the friction of cooperative living. By providing a transparent, beautifully designed platform, we empower society committees to govern effortlessly, while giving residents peace of mind.
            </p>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Heart color={theme.accent} size={20} /> <span style={{ fontWeight: '500' }}>Built with Care</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Users color={theme.mutedOlive} size={20} /> <span style={{ fontWeight: '500' }}>For Everyone</span></div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
            style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <div style={{ padding: '40px', background: theme.bg, borderRadius: '30px', border: `1px solid ${theme.border}`, position: 'relative' }}>
              <SwirlDoodle />
              <Activity size={40} color={theme.accent} style={{ marginBottom: '20px' }} />
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', margin: '0 0 10px 0' }}>Real-time transparency.</h3>
              <p style={{ color: theme.textSec, lineHeight: '1.6', margin: 0 }}>Every maintenance request, every bill, every notice is tracked and updated in real-time. No more chasing the secretary.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECURITY SECTION */}
      <section id="security" className="px-6 md:px-[60px] py-[80px] md:py-[100px] relative z-10 bg-[#F9F8F3]">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative' }}
        >
          <StarburstDoodle style={{ position: 'absolute', top: '-20px', left: '10%', transform: 'scale(0.8)' }} />
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: '600', color: theme.textMain, marginBottom: '20px' }}>
            Platform <HighlightDoodle>Security</HighlightDoodle>
          </h2>
          <p style={{ fontSize: '18px', color: theme.textSec, lineHeight: '1.8' }}>
            At Awaastech, the security of your data and the physical safety of your community are our top priorities. We employ enterprise-grade security protocols with End-to-End Encryption, Role-Based Access Control, and Continuous Monitoring.
          </p>
        </motion.div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="px-6 md:px-[60px] py-[80px] md:py-[100px] relative z-10 bg-white" style={{ borderTop: `1px solid ${theme.border}` }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
          style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', position: 'relative' }}
        >
          <SquiggleDoodle style={{ position: 'absolute', bottom: '-20px', right: '10%', opacity: 0.5 }} />
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '42px', fontWeight: '600', color: theme.textMain, marginBottom: '20px' }}>Contact Us</h2>
          <p style={{ fontSize: '18px', color: theme.textSec, lineHeight: '1.8', marginBottom: '30px' }}>
            Need support or have inquiries? Our team is available to assist you.
          </p>
          <motion.div whileHover={{ scale: 1.05 }} style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: '#F9F8F3', padding: '15px 30px', borderRadius: '40px', border: `1px solid ${theme.border}` }}>
            <span style={{ fontWeight: '500', color: theme.textMain }}>Email Support:</span>
            <a href="mailto:awaastech@gmail.com" style={{ color: theme.accent, textDecoration: 'none', fontWeight: '600' }}>awaastech@gmail.com</a>
          </motion.div>
        </motion.div>
      </section>

      {/* PRIVACY & TERMS OVERVIEW */}
      <section id="legal" className="px-6 md:px-[60px] py-[60px] relative z-10 bg-[#F9F8F3]" style={{ borderTop: `1px solid ${theme.border}` }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '40px', position: 'relative' }}>
          <ArrowDoodle style={{ position: 'absolute', top: '-10px', left: '45%', opacity: 0.3 }} />
          
          <motion.div id="privacy" initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ flex: '1 1 300px' }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: theme.textMain, marginBottom: '15px' }}>Privacy Policy</h3>
            <p style={{ color: theme.textSec, lineHeight: '1.6', fontSize: '15px' }}>We are committed to protecting the privacy and security of your personal information. We never sell your personal data to third parties and take reasonable measures to protect information about you from unauthorized access.</p>
          </motion.div>
          
          <motion.div id="terms" initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} style={{ flex: '1 1 300px' }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', color: theme.textMain, marginBottom: '15px' }}>Terms of Service</h3>
            <p style={{ color: theme.textSec, lineHeight: '1.6', fontSize: '15px' }}>By accessing or using our services, you agree to be bound by our Terms. You may use our services only as permitted by law, and we provide our services using a commercially reasonable level of skill and care.</p>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-6 md:px-[60px] py-[60px] md:py-[80px] relative z-10" style={{ backgroundColor: theme.textMain, color: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '60px' }}>
          
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src="/awaastech-logo.png" alt="Awaastech" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
              </div>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600' }}>Awaastech</span>
            </div>
            <p style={{ color: '#A0A0A0', lineHeight: '1.6', fontSize: '15px', fontWeight: '300' }}>
              The premium operating system for modern housing societies.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '18px', margin: '0 0 20px 0', fontFamily: "'Cormorant Garamond', serif" }}>Product</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="#features" style={{ color: '#A0A0A0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='white'} onMouseOut={e=>e.target.style.color='#A0A0A0'}>Features</a></li>
              <li><a href="#security" style={{ color: '#A0A0A0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='white'} onMouseOut={e=>e.target.style.color='#A0A0A0'}>Security</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '18px', margin: '0 0 20px 0', fontFamily: "'Cormorant Garamond', serif" }}>Company</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><a href="#about" style={{ color: '#A0A0A0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='white'} onMouseOut={e=>e.target.style.color='#A0A0A0'}>About Us</a></li>
              <li><a href="#contact" style={{ color: '#A0A0A0', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e=>e.target.style.color='white'} onMouseOut={e=>e.target.style.color='#A0A0A0'}>Contact</a></li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left" style={{ maxWidth: '1200px', margin: '60px auto 0 auto', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '30px', color: '#A0A0A0', fontSize: '14px' }}>
          <p>© {new Date().getFullYear()} AwaasTech Inc. All Rights Reserved.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#privacy" style={{ color: '#A0A0A0', textDecoration: 'none' }}>Privacy</a>
            <a href="#terms" style={{ color: '#A0A0A0', textDecoration: 'none' }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc, delay = 0, doodle }) => (
  <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6, delay: delay }}
    whileHover={{ y: -8, boxShadow: '0 12px 30px rgba(0,0,0,0.06)' }}
    style={{ padding: '40px', borderRadius: '24px', background: '#FFFDF9', border: '1px solid #E8E4D9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '20px', position: 'relative', overflow: 'hidden' }}>
    {doodle}
    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#F9F8F3', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
      {icon}
    </div>
    <div style={{ position: 'relative', zIndex: 1 }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', fontWeight: '500', color: '#2C2C2C', fontFamily: "'Cormorant Garamond', serif" }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: '#6B6B6B', fontWeight: '300' }}>{desc}</p>
    </div>
  </motion.div>
);

const WalkthroughStep = ({ number, icon, title, desc, align, doodle }) => (
  <motion.div initial={{ opacity: 0, x: align === 'left' ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8 }}
    style={{ display: 'flex', flexDirection: align === 'left' ? 'row' : 'row-reverse', flexWrap: 'wrap', alignItems: 'center', gap: '30px', background: '#FFFDF9', padding: '40px', borderRadius: '24px', border: '1px solid #E8E4D9', boxShadow: '0 8px 30px rgba(0,0,0,0.03)', position: 'relative', zIndex: 1 }}>
    
    {doodle}

    <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: '#F9F8F3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1, border: '1px solid #E8E4D9' }}>
      {icon}
      <div style={{ position: 'absolute', top: '-12px', [align === 'left' ? 'left' : 'right']: '-12px', background: '#D9734E', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '600', color: 'white', boxShadow: '0 4px 10px rgba(217,115,78,0.3)' }}>
        {number}
      </div>
    </div>
    
    <div style={{ textAlign: align === 'left' ? 'left' : 'right', zIndex: 1, flex: '1 1 250px' }}>
      <h3 style={{ margin: '0 0 12px 0', fontSize: '26px', fontWeight: '600', color: '#2C2C2C', fontFamily: "'Cormorant Garamond', serif" }}>{title}</h3>
      <p style={{ margin: 0, fontSize: '16px', lineHeight: '1.6', color: '#6B6B6B', fontWeight: '300' }}>{desc}</p>
    </div>
  </motion.div>
);

export default Home;