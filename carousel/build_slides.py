import os
import subprocess
import pypdf
from PIL import Image

CAROUSEL_DIR = r"d:\Projects\society-management-system\carousel"
SCREENSHOTS_DIR = os.path.join(CAROUSEL_DIR, "screenshots")
ASSETS_DIR = os.path.join(CAROUSEL_DIR, "assets")
ROOT_DIR = r"d:\Projects\society-management-system"

os.makedirs(ASSETS_DIR, exist_ok=True)

# 22 Slides Arranged in Exact Menu Tabs Order:
# 1 Cover + 4 Onboarding/Auth + 16 Menu Tabs (1:1 with app sidebar) + 1 Production Outro
slides_data = [
    {
        "id": 1,
        "type": "cover",
        "tab_label": "Introducing Society Management 2.0",
        "tag": "Production Architecture Tour",
        "title": "Living Spaces,<br/><span style=\"font-style: italic; color: var(--accent); position: relative; display: inline-block;\">Beautifully Managed.<svg style=\"position: absolute; bottom: -8px; left: 0; width: 100%; height: 12px;\" viewBox=\"0 0 200 12\" fill=\"none\"><path d=\"M2 6C30 -2 50 14 80 6C110 -2 130 14 160 6C180 -1 195 10 198 6\" stroke=\"#D9734E\" stroke-width=\"3\" stroke-linecap=\"round\"/></svg></span>",
        "subtitle": "<strong>Awaastech: Production-Grade Society Management</strong><br/>A live interface tour following the complete resident &amp; admin menu navigation.",
        "pills": ["👥 4 Tailored Roles", "🔒 Redis Lua Locks", "📍 GPS Geofenced Escrow", "🤖 LangGraph AI Agent", "📊 Tally ERP & Analytics"],
        "doodle_note": "Distributed Systems Under The Hood ⚡",
        "footer_author": "✨ Awaastech Engineering",
        "footer_hint": "Swipe to explore 👉"
    },
    {
        "id": 2,
        "type": "screenshot",
        "tab_label": "Public Gateway",
        "tag": "First Impressions",
        "title": "Landing Page: Modern Residential Gateway",
        "subtitle": "A clean, conversion-focused public portal introducing smart society governance, role highlights, and instant onboarding.",
        "screenshot": "landingpage.png",
        "url": "https://awaastech.com",
        "doodle_note": "Clean & Conversion Focused 🚀",
        "footer_author": "frontend/src/pages/LandingPage.jsx",
        "footer_hint": "Next: Society Registration 👉"
    },
    {
        "id": 3,
        "type": "screenshot",
        "tab_label": "Society Provisioning",
        "tag": "Onboarding Flow",
        "title": "Registration: Self-Service Society Setup",
        "subtitle": "Comprehensive onboarding capturing society address, tower wings, flat counts, bank details, and admin credentials.",
        "screenshot": "registerpagesallfiedldcomplete.png",
        "url": "https://app.awaastech.com/register/society-details",
        "doodle_note": "Structured Schema Validation 📋",
        "footer_author": "frontend/src/pages/Register.jsx",
        "footer_hint": "Next: Identity Verification 👉"
    },
    {
        "id": 4,
        "type": "screenshot",
        "tab_label": "Identity Verification",
        "tag": "Two-Factor Clearance",
        "title": "Email OTP Verification: Secure Security Gate",
        "subtitle": "Time-limited cryptographic passcode verification preventing fake accounts, spam societies, and unauthorized access.",
        "screenshot": "verifymailid.png",
        "url": "https://app.awaastech.com/verify-email",
        "doodle_note": "Anti-Bot & Spam Defense 🛡️",
        "footer_author": "backend/controllers/auth.verify.controller.ts",
        "footer_hint": "Next: Unified Sign-in 👉"
    },
    {
        "id": 5,
        "type": "screenshot",
        "tab_label": "Authentication",
        "tag": "Role-Based Access",
        "title": "Unified Login: Intelligent Role Redirection",
        "subtitle": "Single sign-in gateway directing Admins, Residents, and Security Personnel with encrypted httpOnly cookie tokens.",
        "screenshot": "loginpage.png",
        "url": "https://app.awaastech.com/login",
        "doodle_note": "Granular RBAC Engine 🔑",
        "footer_author": "frontend/src/pages/Login.jsx",
        "footer_hint": "Next: Menu Tab 01 — Overview 👉"
    },
    # --- 16 MENU TABS IN EXACT SIDEBAR ORDER ---
    {
        "id": 6,
        "type": "screenshot",
        "tab_label": "Menu Tab 01",
        "tag": "Overview",
        "title": "Overview: Central Operations Center",
        "subtitle": "Live telemetry showing maintenance collections, pending grievances, broadcast notices, and active staff counts.",
        "screenshot": "adminsdashboard.png",
        "url": "https://app.awaastech.com/admin/overview",
        "doodle_note": "Real-Time Telemetry 📈",
        "footer_author": "frontend/src/components/DashboardOverview.jsx",
        "footer_hint": "Next: Menu Tab 02 — My Profile 👉"
    },
    {
        "id": 7,
        "type": "screenshot",
        "tab_label": "Menu Tab 02",
        "tag": "My Profile",
        "title": "My Profile: Account Security & RBAC Settings",
        "subtitle": "Society profile management, bank account settlement details, session controls, and strict permission matrix.",
        "screenshot": "adminsprofilesettings.png",
        "url": "https://app.awaastech.com/admin/profile",
        "doodle_note": "Bank-Grade RBAC Security 🛡️",
        "footer_author": "frontend/src/pages/Profile.jsx",
        "footer_hint": "Next: Menu Tab 03 — Member Registry 👉"
    },
    {
        "id": 8,
        "type": "screenshot",
        "tab_label": "Menu Tab 03",
        "tag": "Member Registry",
        "title": "Member Registry: Wings, Flats & Occupancy",
        "subtitle": "Instant resident search, verified owner vs. tenant classification, vehicle license plates, and individual unit ledgers.",
        "screenshot": "membersregistrypage.png",
        "url": "https://app.awaastech.com/admin/members",
        "doodle_note": "Instant Wing & Flat Search 🔍",
        "footer_author": "frontend/src/components/UserList.jsx",
        "footer_hint": "Next: Menu Tab 04 — Notice Board 👉"
    },
    {
        "id": 9,
        "type": "screenshot",
        "tab_label": "Menu Tab 04",
        "tag": "Notice Board",
        "title": "Notice Board: Circulars & Community Alerts",
        "subtitle": "Official circulars, emergency announcements, and utility schedules broadcast to all residents with instant notifications.",
        "screenshot": "noticeboardpage.png",
        "url": "https://app.awaastech.com/admin/notices",
        "doodle_note": "Instant Broadcasts 📢",
        "footer_author": "frontend/src/components/NoticeBoard.jsx",
        "footer_hint": "Next: Menu Tab 05 — Global Meetings 👉"
    },
    {
        "id": 10,
        "type": "screenshot",
        "tab_label": "Menu Tab 05",
        "tag": "Global Meetings",
        "title": "Global Meetings: Agendas, Quorum & Minutes",
        "subtitle": "Schedule committee meetings, notify resident members, record attendance quorum, and archive certified meeting minutes.",
        "screenshot": "meetingpage.png",
        "url": "https://app.awaastech.com/admin/meetings",
        "doodle_note": "Certified Legal Minutes ⚖️",
        "footer_author": "frontend/src/components/Meetings.jsx",
        "footer_hint": "Next: Menu Tab 06 — Billing System 👉"
    },
    {
        "id": 11,
        "type": "screenshot",
        "tab_label": "Menu Tab 06",
        "tag": "Billing System",
        "title": "Billing System: Automated Invoicing & Dues",
        "subtitle": "Automated recurring maintenance generation with late penalty calculations and distributed locks to prevent double-charges.",
        "screenshot": "billingpage.png",
        "url": "https://app.awaastech.com/admin/bills",
        "doodle_note": "Redis Lua Concurrency Locks 🔒",
        "footer_author": "backend/services/billService.ts",
        "footer_hint": "Next: Menu Tab 07 — Complaints 👉"
    },
    {
        "id": 12,
        "type": "screenshot",
        "tab_label": "Menu Tab 07",
        "tag": "Complaints",
        "title": "Complaints: Smart AI-Assisted Helpdesk",
        "subtitle": "Automated ticket classification, priority tagging, and transparent SLA tracking for plumbing, electrical, and security issues.",
        "screenshot": "complaintspage.png",
        "url": "https://app.awaastech.com/admin/complaints",
        "doodle_note": "LangGraph Dispute Triaging 🤖",
        "footer_author": "backend/services/aiService.ts",
        "footer_hint": "Next: Menu Tab 08 — Parcel Gate Locker 👉"
    },
    {
        "id": 13,
        "type": "screenshot",
        "tab_label": "Menu Tab 08",
        "tag": "Parcel Gate Locker",
        "title": "Parcel Gate Locker: 4-Digit Claim PINs",
        "subtitle": "Gatekeepers log packages from Amazon, courier, and food deliveries with secure OTP handoff to eliminate lost deliveries.",
        "screenshot": "parceltrackingpage.png",
        "url": "https://app.awaastech.com/admin/parcels",
        "doodle_note": "Zero Lost Packages 📦",
        "footer_author": "frontend/src/components/gate/ParcelGateLocker.jsx",
        "footer_hint": "Next: Menu Tab 09 — Domestic Staff Directory 👉"
    },
    {
        "id": 14,
        "type": "screenshot",
        "tab_label": "Menu Tab 09",
        "tag": "Domestic Staff Directory",
        "title": "Domestic Staff Directory: Attendance & Passes",
        "subtitle": "Maids, drivers, and maintenance staff registry with secure digital gate passes, entry timestamps, and resident ratings.",
        "screenshot": "domesticstaffpage.png",
        "url": "https://app.awaastech.com/admin/staff-dir",
        "doodle_note": "Safety & Gate Verification 🛂",
        "footer_author": "frontend/src/components/gate/StaffDirectory.jsx",
        "footer_hint": "Next: Menu Tab 10 — Facility Bookings 👉"
    },
    {
        "id": 15,
        "type": "screenshot",
        "tab_label": "Menu Tab 10",
        "tag": "Facility Bookings",
        "title": "Facility Bookings: Conflict-Free Scheduling",
        "subtitle": "Clubhouse, swimming pool, and sports court reservations powered by atomic locks to eliminate double-booking clashes.",
        "screenshot": "facilitypage.png",
        "url": "https://app.awaastech.com/admin/amenities",
        "doodle_note": "Zero Double-Bookings ⏱️",
        "footer_author": "frontend/src/components/lifestyle/AmenityBooking.jsx",
        "footer_hint": "Next: Menu Tab 11 — Digital AGM & Voting 👉"
    },
    {
        "id": 16,
        "type": "screenshot",
        "tab_label": "Menu Tab 11",
        "tag": "Digital AGM & Voting",
        "title": "Digital AGM & Voting: 1-Flat-1-Vote Ballots",
        "subtitle": "Tamper-evident community ballots, candidate elections, and real-time verifiable poll counts for transparent governance.",
        "screenshot": "digitalvotingpage.png",
        "url": "https://app.awaastech.com/admin/agm",
        "doodle_note": "Tamper-Evident Ballots 🗳️",
        "footer_author": "frontend/src/components/lifestyle/DigitalAGM.jsx",
        "footer_hint": "Next: Menu Tab 12 — Tally & Accounting 👉"
    },
    {
        "id": 17,
        "type": "screenshot",
        "tab_label": "Menu Tab 12",
        "tag": "Tally & Accounting",
        "title": "Tally & Accounting: Double-Entry Ledger ERP",
        "subtitle": "Auditor-grade double-entry ledger, journal entries, cashbooks, and 1-click XML/Excel exports for Tally integration.",
        "screenshot": "tallyaccontantpage.png",
        "url": "https://app.awaastech.com/admin/accounting",
        "doodle_note": "Auditor-Ready Books 📘",
        "footer_author": "frontend/src/components/finance/AccountingCenter.jsx",
        "footer_hint": "Next: Menu Tab 13 — Green Sustainability 👉"
    },
    {
        "id": 18,
        "type": "screenshot",
        "tab_label": "Menu Tab 13",
        "tag": "Green Sustainability",
        "title": "Green Sustainability: Solar, Water & ESG",
        "subtitle": "Live solar panel telemetry, rainwater harvesting levels, waste segregation tracking, and community carbon scorecards.",
        "screenshot": "greensociety&sustainabilityERPpage.png",
        "url": "https://app.awaastech.com/admin/sustainability",
        "doodle_note": "Net-Zero Community Living ☀️",
        "footer_author": "frontend/src/components/sustainability/GreenSustainability.jsx",
        "footer_hint": "Next: Menu Tab 14 — WhatsApp Bot Simulator 👉"
    },
    {
        "id": 19,
        "type": "screenshot",
        "tab_label": "Menu Tab 14",
        "tag": "WhatsApp Bot Simulator",
        "title": "WhatsApp Bot: AI Resident Concierge",
        "subtitle": "Allow residents to query dues, approve delivery drivers, and report issues directly inside WhatsApp without downloading an app.",
        "screenshot": "whatsappbusinessbotsimulatorpage.png",
        "url": "https://app.awaastech.com/admin/whatsapp",
        "doodle_note": "Zero App Download Needed 📱",
        "footer_author": "frontend/src/components/omnichannel/WhatsAppSimulator.jsx",
        "footer_hint": "Next: Menu Tab 15 — White-Label Theme 👉"
    },
    {
        "id": 20,
        "type": "screenshot",
        "tab_label": "Menu Tab 15",
        "tag": "White-Label Theme",
        "title": "White-Label Theme: Custom Society Branding",
        "subtitle": "Multi-tenant branding engine allowing housing societies to configure bespoke color palettes, dark modes, and community logos.",
        "screenshot": "enterprisethemepage.png",
        "url": "https://app.awaastech.com/admin/theme",
        "doodle_note": "Multi-Tenant White-Label 🖌️",
        "footer_author": "frontend/src/components/ThemeSettings.jsx",
        "footer_hint": "Next: Menu Tab 16 — Analytics Reports 👉"
    },
    {
        "id": 21,
        "type": "screenshot",
        "tab_label": "Menu Tab 16",
        "tag": "Analytics Reports",
        "title": "Analytics Reports: Financial & Operational Telemetry",
        "subtitle": "Comprehensive analytics tracking collection velocity, occupancy ratios, expense breakdowns, and predictive cash flow.",
        "screenshot": "analyticspage.png",
        "url": "https://app.awaastech.com/admin/analytics",
        "doodle_note": "End-to-End Analytical Depth 📊",
        "footer_author": "frontend/src/components/Analytics.jsx",
        "footer_hint": "Next: Platform Wrap-Up 👉"
    },
    {
        "id": 22,
        "type": "outro",
        "tab_label": "Production Summary",
        "tag": "Architecture Takeaways",
        "title": "Built for Modern Communities.<br/><span style=\"font-style: italic; color: var(--accent);\">Production-Grade Engineering.</span>",
        "subtitle": "From automated maintenance billing to AI dispute reconciliation and ALPR security — Awaastech redefines society management.",
        "pills": ["Node.js & Express", "TypeScript & RBAC", "MongoDB & Redis Lua", "BullMQ Async DLQ", "React 19 & Tailwind", "LangGraph AI Agents"],
        "doodle_note": "Production Ready & Open Source ⭐",
        "footer_author": "github.com/SuyashShinde10/society-management-system",
        "footer_hint": "Star on GitHub & Share! 🚀"
    }
]

TOTAL_SLIDES = len(slides_data)

def generate_html():
    slides_html = []
    
    # SVG Doodle definitions
    svg_star_terracotta = '<svg class="doodle-star" style="width: 24px; height: 24px; fill: var(--accent);" viewBox="0 0 40 40"><path d="M20 0L23 17L40 20L23 23L20 40L17 23L0 20L17 17L20 0Z"/></svg>'
    svg_star_olive = '<svg class="doodle-star" style="width: 20px; height: 20px; fill: var(--olive);" viewBox="0 0 40 40"><path d="M20 0L23 17L40 20L23 23L20 40L17 23L0 20L17 17L20 0Z"/></svg>'

    for s in slides_data:
        sid = s["id"]
        slide_num_str = f"{sid:02d} / {TOTAL_SLIDES:02d}"
        
        if s["type"] == "cover":
            # Slide 1: Cover Slide matching reference PDF page 1
            slide_content = f'''
    <!-- SLIDE {sid}: COVER -->
    <div class="slide-wrapper slide-item" id="slide-{sid}" style="display: {'flex' if sid==1 else 'none'};">
      <div class="slide-header">
        <div class="slide-tag"><span class="dot"></span> {s["tag"]}</div>
        <span class="slide-page-num">{slide_num_str}</span>
      </div>
      <div class="slide-content cover-content">
        <!-- Doodles -->
        <svg class="doodle-squiggle" style="top: 24px; left: 36px; width: 68px; height: 32px;" viewBox="0 0 80 30" fill="none">
          <path d="M5 20 C15 5, 25 30, 35 15 C45 5, 55 28, 65 14 C70 8, 75 18, 78 12" stroke="#D9734E" stroke-width="4" stroke-linecap="round"/>
        </svg>

        <div style="position: absolute; top: 22px; right: 40px; display: flex; align-items: center; gap: 8px;">
          <span class="doodle-pill-dark" style="font-size: 11px;">Distributed Systems</span>
          <span class="doodle-pill-dark" style="font-size: 11px;">Redis Lua Locks</span>
        </div>

        <svg class="doodle-star" style="top: 85px; left: 30px; width: 34px; height: 34px; fill: var(--charcoal);" viewBox="0 0 40 40">
          <path d="M20 0L23 17L40 20L23 23L20 40L17 23L0 20L17 17L20 0Z"/>
        </svg>
        <svg class="doodle-star" style="top: 145px; right: 50px; width: 28px; height: 28px; fill: var(--olive);" viewBox="0 0 40 40">
          <path d="M20 0L23 17L40 20L23 23L20 40L17 23L0 20L17 17L20 0Z"/>
        </svg>

        <svg class="doodle-arrow" style="top: 90px; right: 130px; width: 42px; height: 42px;" viewBox="0 0 50 50">
          <path d="M35 10 Q 20 25 15 42 M 10 32 L 15 42 L 25 38" />
        </svg>

        <h2 class="slide-title cover-title">
          {s["title"]}
        </h2>

        <div class="cover-subtitle-box">
          <span style="font-family: 'Cormorant Garamond', serif; font-size: 32px; color: var(--accent); font-weight: 300;">{{</span>
          <p class="slide-subtitle cover-subtitle">{s["subtitle"]}</p>
          <span style="font-family: 'Cormorant Garamond', serif; font-size: 32px; color: var(--accent); font-weight: 300;">}}</span>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 14px; max-width: 620px;">
          {' '.join(f'<span class="feature-tag">{p}</span>' for p in s["pills"])}
        </div>

        <!-- Bottom Pill Badges & Arrow -->
        <div style="position: absolute; bottom: 35px; left: 40px; display: flex; align-items: center; gap: 10px;">
          <span class="doodle-pill-terracotta">AI Dispute Agent</span>
          <svg class="doodle-arrow" style="width: 32px; height: 28px; transform: rotate(-30deg);" viewBox="0 0 50 50">
            <path d="M40 25 L 12 25 M 22 15 L 12 25 L 22 35" />
          </svg>
          <svg class="doodle-star" style="width: 24px; height: 24px; fill: var(--accent);" viewBox="0 0 40 40">
            <path d="M20 0L23 17L40 20L23 23L20 40L17 23L0 20L17 17L20 0Z"/>
          </svg>
        </div>

        <div style="position: absolute; bottom: 35px; right: 155px;">
          <svg class="doodle-arrow" style="width: 32px; height: 32px; margin-bottom: 2px; margin-left: 20px;" viewBox="0 0 50 50">
            <path d="M15 10 Q 30 20 30 40 M 20 32 L 30 42 L 38 32" />
          </svg>
          <span class="doodle-pill-olive">Geofenced Escrow</span>
        </div>

        <!-- Hand-drawn Building Sketch (Bottom Right) -->
        <svg class="building-sketch" style="position: absolute; bottom: 20px; right: 28px; width: 110px; height: 110px;" viewBox="0 0 100 100" fill="none">
          <rect x="55" y="15" width="40" height="80" rx="3" stroke="#2C2C2C" stroke-width="2.2"/>
          <line x1="63" y1="26" x2="71" y2="26" stroke="#2C2C2C" stroke-width="2"/>
          <line x1="79" y1="26" x2="87" y2="26" stroke="#2C2C2C" stroke-width="2"/>
          <line x1="63" y1="38" x2="71" y2="38" stroke="#2C2C2C" stroke-width="2"/>
          <line x1="79" y1="38" x2="87" y2="38" stroke="#2C2C2C" stroke-width="2"/>
          <line x1="63" y1="50" x2="71" y2="50" stroke="#2C2C2C" stroke-width="2"/>
          <line x1="79" y1="50" x2="87" y2="50" stroke="#2C2C2C" stroke-width="2"/>
          <line x1="63" y1="62" x2="71" y2="62" stroke="#2C2C2C" stroke-width="2"/>
          <line x1="79" y1="62" x2="87" y2="62" stroke="#2C2C2C" stroke-width="2"/>
          <rect x="32" y="42" width="23" height="53" rx="2" stroke="#2C2C2C" stroke-width="2"/>
          <line x1="38" y1="52" x2="48" y2="52" stroke="#2C2C2C" stroke-width="1.8"/>
          <line x1="38" y1="64" x2="48" y2="64" stroke="#2C2C2C" stroke-width="1.8"/>
          <line x1="38" y1="76" x2="48" y2="76" stroke="#2C2C2C" stroke-width="1.8"/>
          <rect x="12" y="60" width="20" height="35" rx="2" stroke="#2C2C2C" stroke-width="2"/>
          <line x1="17" y1="70" x2="26" y2="70" stroke="#2C2C2C" stroke-width="1.8"/>
          <line x1="17" y1="80" x2="26" y2="80" stroke="#2C2C2C" stroke-width="1.8"/>
          <line x1="5" y1="95" x2="98" y2="95" stroke="#2C2C2C" stroke-width="2.5" stroke-linecap="round"/>
        </svg>

      </div>
      <div class="slide-footer">
        <span class="slide-author">{s["footer_author"]}</span>
        <span class="slide-swipe-hint">{s["footer_hint"]}</span>
      </div>
    </div>
'''
        elif s["type"] == "outro":
            # Slide 22: Outro Slide
            slide_content = f'''
    <!-- SLIDE {sid}: OUTRO / SUMMARY -->
    <div class="slide-wrapper slide-item" id="slide-{sid}" style="display: none;">
      <div class="slide-header">
        <div class="slide-tag"><span class="dot"></span> {s["tag"]}</div>
        <span class="slide-page-num">{slide_num_str}</span>
      </div>
      <div class="slide-content cover-content">
        <span class="doodle-note" style="top: 25px; left: 40px;">{s["doodle_note"]}</span>
        <svg class="doodle-star" style="top: 30px; right: 50px; width: 34px; height: 34px; fill: var(--accent);" viewBox="0 0 40 40">
          <path d="M20 0L23 17L40 20L23 23L20 40L17 23L0 20L17 17L20 0Z"/>
        </svg>

        <h2 class="slide-title" style="font-size: 40px; margin-bottom: 12px; text-align: center;">
          {s["title"]}
        </h2>

        <p class="slide-subtitle" style="text-align: center; max-width: 600px; margin-bottom: 22px;">
          {s["subtitle"]}
        </p>

        <!-- Tech Stack Pill Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-width: 600px; width: 100%; margin-bottom: 24px;">
          <div class="feature-card">
            <span style="font-size: 18px;">⚡</span>
            <div>
              <strong style="font-size: 13px; color: var(--charcoal);">Idempotent Billing &amp; Webhooks</strong>
              <p style="font-size: 11px; color: var(--muted); margin-top: 2px;">Redis Lua distributed locks eliminate double-charges across concurrent servers.</p>
            </div>
          </div>
          <div class="feature-card">
            <span style="font-size: 18px;">🤖</span>
            <div>
              <strong style="font-size: 13px; color: var(--charcoal);">LangGraph Dispute Agents</strong>
              <p style="font-size: 11px; color: var(--muted); margin-top: 2px;">Autonomous LLM triaging resolves billing disputes and categorizes maintenance tickets.</p>
            </div>
          </div>
          <div class="feature-card">
            <span style="font-size: 18px;">📍</span>
            <div>
              <strong style="font-size: 13px; color: var(--charcoal);">GPS Geofenced Escrow</strong>
              <p style="font-size: 11px; color: var(--muted); margin-top: 2px;">turf.js polygon boundaries enforce contractor presence before vendor milestone funds release.</p>
            </div>
          </div>
          <div class="feature-card">
            <span style="font-size: 18px;">🛡️</span>
            <div>
              <strong style="font-size: 13px; color: var(--charcoal);">Bank-Grade RBAC &amp; httpOnly</strong>
              <p style="font-size: 11px; color: var(--muted); margin-top: 2px;">Strict role isolation across 35+ endpoints with stateless Redis token blacklisting.</p>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 12px; align-items: center; justify-content: center; margin-top: 6px;">
          <span class="doodle-pill-terracotta" style="font-size: 12.5px; padding: 7px 18px;">⭐ Open Source on GitHub</span>
          <span class="doodle-pill-dark" style="font-size: 12.5px; padding: 7px 18px;">🌐 Live on Vercel</span>
        </div>

        <svg class="doodle-arrow" style="bottom: 30px; right: 80px; width: 42px; height: 42px;" viewBox="0 0 50 50">
          <path d="M10 40 Q 25 10 40 20 M 30 10 L 40 20 L 30 30" />
        </svg>
      </div>
      <div class="slide-footer">
        <span class="slide-author">{s["footer_author"]}</span>
        <span class="slide-swipe-hint">{s["footer_hint"]}</span>
      </div>
    </div>
'''
        else:
            # Full Screenshot slide: Dynamic Card Dimensions Matching Exact Image Size (Zero Crop, Zero Zoom-Out)
            shot_file = s["screenshot"]
            img_rel_path = f"screenshots/{shot_file}"
            img_abs_path = os.path.join(SCREENSHOTS_DIR, shot_file)
            
            with Image.open(img_abs_path) as img:
                iw, ih = img.size
            ar = iw / ih

            # 1080px Canvas Dimensions (PDF / Export)
            max_w_1080 = 980
            max_vh_1080 = 678
            topbar_1080 = 42

            # 760px Canvas Dimensions (Web Slideshow)
            max_w_760 = 688
            max_vh_760 = 482
            topbar_760 = 38

            if (max_w_1080 / ar) <= max_vh_1080:
                cw_1080 = max_w_1080
                vh_1080 = round(max_w_1080 / ar)
                cw_760 = max_w_760
                vh_760 = round(max_w_760 / ar)
            else:
                vh_1080 = max_vh_1080
                cw_1080 = round(max_vh_1080 * ar)
                vh_760 = max_vh_760
                cw_760 = round(max_vh_760 * ar)

            vw_1080 = cw_1080
            vw_760 = cw_760
            ch_1080 = vh_1080 + topbar_1080
            ch_760 = vh_760 + topbar_760
            
            is_even = (sid % 2 == 0)
            star_markup = svg_star_terracotta if is_even else svg_star_olive

            slide_content = f'''
    <!-- SLIDE {sid}: {s["title"]} -->
    <div class="slide-wrapper slide-item" id="slide-{sid}" style="display: none;">
      
      <!-- Slide Header: Contains Tag, Note, and Page Number with Zero Overlap -->
      <div class="slide-header">
        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
          <div class="slide-tag"><span class="dot"></span> {s["tab_label"]}: {s["tag"]}</div>
          <span class="doodle-note-pill">{s["doodle_note"]}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          {star_markup}
          <span class="slide-page-num">{slide_num_str}</span>
        </div>
      </div>

      <!-- Slide Body: Clean Typography + Card Adjusted Exactly to Image Size -->
      <div class="slide-content screenshot-slide-content">
        <div class="title-container">
          <h2 class="slide-title screenshot-slide-title">
            {s["title"]}
          </h2>
          <p class="slide-subtitle screenshot-slide-subtitle">
            {s["subtitle"]}
          </p>
        </div>

        <!-- Centered Card Container (Card adjusts to image size: Zero crop, zero empty borders) -->
        <div class="browser-card-container">
          <div class="browser-mockup" style="--cw-1080: {cw_1080}px; --ch-1080: {ch_1080}px; --vw-1080: {vw_1080}px; --vh-1080: {vh_1080}px; --cw-760: {cw_760}px; --ch-760: {ch_760}px; --vw-760: {vw_760}px; --vh-760: {vh_760}px;">
            <div class="browser-topbar">
              <div class="browser-dots">
                <span class="b-dot b-red"></span>
                <span class="b-dot b-yellow"></span>
                <span class="b-dot b-green"></span>
              </div>
              <div class="browser-address-bar">
                <svg style="width: 11px; height: 11px; fill: var(--olive); flex-shrink: 0;" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/></svg>
                <span>{s["url"]}</span>
              </div>
              <div class="browser-live-badge">
                Live Interface
              </div>
            </div>
            <div class="browser-viewport">
              <img class="screenshot-img" src="{img_rel_path}" alt="{s["title"]}" loading="eager" />
            </div>
          </div>
        </div>

      </div>

      <!-- Slide Footer -->
      <div class="slide-footer">
        <span class="slide-author">{s["footer_author"]}</span>
        <span class="slide-swipe-hint">{s["footer_hint"]}</span>
      </div>
    </div>
'''
        slides_html.append(slide_content)

    all_slides_html_str = "\n".join(slides_html)

    # Build image gallery cards
    gallery_cards = []
    for s in slides_data:
        if s["type"] == "screenshot":
            gallery_cards.append(f'''
      <div class="image-card">
        <img src="screenshots/{s["screenshot"]}" alt="{s["title"]}" />
        <div class="image-card-caption">
          <div>
            <div style="font-weight: 600; font-size: 13px;">{s["tab_label"]} • {s["title"]}</div>
            <div style="font-size: 11px; color: var(--muted); font-family: 'JetBrains Mono', monospace;">{s["url"]}</div>
          </div>
          <a href="screenshots/{s["screenshot"]}" target="_blank" class="btn" style="padding: 4px 10px; font-size: 11px;">Full View</a>
        </div>
      </div>
''')
    gallery_html_str = "\n".join(gallery_cards)

    full_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Awaastech — The Complete Society Management Platform Tour (LinkedIn Carousel)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,400;1,600&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {{
      --bg: #F9F8F3;
      --surface: #FFFDF9;
      --card-bg: #FFFFFF;
      --border: #E8E4D9;
      --accent: #D9734E;
      --accent-light: #F7EAE3;
      --olive: #6B705C;
      --olive-light: #EFF1EB;
      --charcoal: #2C2C2C;
      --muted: #6B6B6B;
      --sand: #D4A373;
    }}

    * {{ box-sizing: border-box; margin: 0; padding: 0; }}

    body {{
      background-color: #EFECE6;
      color: var(--charcoal);
      font-family: 'Outfit', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px;
    }}

    /* Top Action Bar */
    .top-bar {{
      max-width: 1080px;
      width: 100%;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 14px 24px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
    }}

    .brand-group {{
      display: flex;
      align-items: center;
      gap: 12px;
    }}

    .brand-logo-badge {{
      width: 40px;
      height: 40px;
      background: var(--accent);
      color: white;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Cormorant Garamond', serif;
      font-weight: 700;
      font-size: 22px;
      box-shadow: 0 4px 12px rgba(217, 115, 78, 0.25);
    }}

    .brand-title {{
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 600;
      color: var(--charcoal);
      line-height: 1.2;
    }}

    .brand-subtitle {{
      font-size: 12.5px;
      color: var(--muted);
    }}

    .actions-group {{
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }}

    .btn {{
      font-family: 'Outfit', sans-serif;
      font-size: 12.5px;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 24px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--charcoal);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      text-decoration: none;
    }}

    .btn:hover {{
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }}

    .btn-primary {{
      background: var(--accent);
      color: white;
      border-color: var(--accent);
      box-shadow: 0 4px 14px rgba(217, 115, 78, 0.25);
    }}

    .btn-primary:hover {{ background: #c56543; }}

    .btn-olive {{
      background: var(--olive);
      color: white;
      border-color: var(--olive);
    }}

    .btn-olive:hover {{ background: #585e4d; }}

    /* Carousel Shell */
    .carousel-container {{
      position: relative;
      max-width: 1080px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }}

    /* Slide Card */
    .slide-wrapper {{
      width: 760px;
      height: 760px;
      max-width: 100%;
      background: var(--bg);
      border-radius: 28px;
      border: 1px solid var(--border);
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.07);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      padding: 30px 36px 20px 36px;
      transition: all 0.3s ease;
    }}

    @media (max-width: 760px) {{
      .slide-wrapper {{
        width: 100%;
        height: auto;
        min-height: 600px;
        padding: 22px 18px 16px 18px;
      }}
    }}

    /* Slide Header - ZERO OVERLAPPING */
    .slide-header {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      position: relative;
      z-index: 5;
    }}

    .slide-tag {{
      display: inline-flex;
      align-items: center;
      gap: 7px;
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 11.5px;
      font-weight: 600;
      color: var(--olive);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
    }}

    .slide-tag .dot {{
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
    }}

    .doodle-note-pill {{
      display: inline-flex;
      align-items: center;
      font-family: 'Outfit', sans-serif;
      font-size: 11px;
      font-weight: 700;
      color: var(--olive);
      background: #FFFDF9;
      border: 1.5px dashed var(--olive);
      padding: 3px 10px;
      border-radius: 20px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.02);
    }}

    .slide-page-num {{
      font-size: 12px;
      font-weight: 600;
      color: var(--muted);
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 4px 10px;
      border-radius: 12px;
    }}

    /* Slide Body */
    .slide-content {{
      flex: 1;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 4;
      min-height: 0;
    }}

    .cover-content {{
      align-items: center;
      justify-content: center;
      text-align: center;
    }}

    .screenshot-slide-content {{
      justify-content: flex-start;
      display: flex;
      flex-direction: column;
      height: 100%;
    }}

    .title-container {{
      margin-bottom: 10px;
      position: relative;
    }}

    .slide-title {{
      font-family: 'Cormorant Garamond', serif;
      font-size: 30px;
      font-weight: 600;
      line-height: 1.15;
      color: var(--charcoal);
      margin-bottom: 4px;
    }}

    .cover-title {{
      font-size: 44px;
      max-width: 620px;
      margin-bottom: 14px;
    }}

    .screenshot-slide-title {{
      font-size: 26px;
      margin-bottom: 3px;
    }}

    .slide-subtitle {{
      font-size: 13px;
      color: var(--muted);
      line-height: 1.4;
      margin-bottom: 0;
    }}

    .cover-subtitle-box {{
      display: flex;
      align-items: center;
      gap: 6px;
      max-width: 580px;
      margin-bottom: 8px;
    }}

    .cover-subtitle {{
      font-size: 14.5px;
      margin-bottom: 0;
    }}

    .screenshot-slide-subtitle {{
      font-size: 12.5px;
      max-width: 95%;
    }}

    /* Dynamic Browser Mockup Window Sized to Screenshot */
    .browser-card-container {{
      flex: 1;
      min-height: 0;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }}

    .browser-mockup {{
      width: var(--cw-760);
      height: var(--ch-760);
      background: #FFFFFF;
      border: 1.5px solid var(--border);
      border-radius: 16px;
      box-shadow: 0 12px 34px rgba(0, 0, 0, 0.06);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      margin: auto auto;
      flex-shrink: 0;
    }}

    .browser-topbar {{
      background: #F8F7F3;
      border-bottom: 1px solid var(--border);
      padding: 7px 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-shrink: 0;
      height: 38px;
    }}

    .browser-dots {{
      display: flex;
      align-items: center;
      gap: 6px;
    }}

    .b-dot {{
      width: 9px;
      height: 9px;
      border-radius: 50%;
    }}

    .b-red {{ background: #FF5F56; }}
    .b-yellow {{ background: #FFBD2E; }}
    .b-green {{ background: #27C93F; }}

    .browser-address-bar {{
      flex: 1;
      max-width: 380px;
      background: #FFFFFF;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 3px 10px;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      color: var(--charcoal);
      display: flex;
      align-items: center;
      gap: 6px;
      margin: 0 auto;
    }}

    .browser-live-badge {{
      font-size: 10px;
      font-weight: 600;
      color: var(--olive);
      background: var(--olive-light);
      padding: 2px 8px;
      border-radius: 8px;
      flex-shrink: 0;
    }}

    /* Viewport matching exact image size (Zero Crop, Zero Zoom-Out) */
    .browser-viewport {{
      width: var(--vw-760);
      height: var(--vh-760);
      background: #FFFFFF;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }}

    .screenshot-img {{
      width: 100%;
      height: 100%;
      object-fit: fill;
      display: block;
    }}

    /* Footer of Slide */
    .slide-footer {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px dashed var(--border);
      position: relative;
      z-index: 5;
      margin-top: 8px;
      flex-shrink: 0;
    }}

    .slide-author {{
      font-size: 11.5px;
      font-weight: 600;
      color: var(--charcoal);
      display: flex;
      align-items: center;
      gap: 6px;
    }}

    .slide-swipe-hint {{
      font-size: 11.5px;
      font-weight: 600;
      color: var(--accent);
      display: flex;
      align-items: center;
      gap: 4px;
    }}

    /* Signature Doodles */
    .doodle-star {{ pointer-events: none; }}
    .doodle-arrow {{ position: absolute; stroke: var(--charcoal); stroke-width: 2.2; fill: none; stroke-linecap: round; stroke-linejoin: round; pointer-events: none; }}
    .doodle-squiggle {{ position: absolute; pointer-events: none; }}
    .building-sketch {{ pointer-events: none; }}

    .doodle-note {{
      position: absolute;
      font-family: 'Outfit', sans-serif;
      font-size: 10.5px;
      font-weight: 700;
      color: var(--olive);
      background: #FFFDF9;
      border: 1.5px dashed var(--olive);
      padding: 3px 9px;
      border-radius: 20px;
      transform: rotate(-3deg);
      box-shadow: 0 4px 10px rgba(0,0,0,0.04);
      z-index: 8;
      pointer-events: none;
    }}

    .doodle-pill-dark {{
      background: #3D4035;
      color: #FFFFFF;
      font-size: 11.5px;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 16px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }}

    .doodle-pill-terracotta {{
      background: var(--accent);
      color: #FFFFFF;
      font-size: 11.5px;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 16px;
      box-shadow: 0 2px 6px rgba(217,115,78,0.25);
    }}

    .doodle-pill-olive {{
      background: var(--olive);
      color: #FFFFFF;
      font-size: 11.5px;
      font-weight: 600;
      padding: 5px 12px;
      border-radius: 16px;
      box-shadow: 0 2px 6px rgba(107,112,92,0.25);
    }}

    .feature-tag {{
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 11.5px;
      font-weight: 500;
      color: var(--charcoal);
    }}

    .feature-card {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px;
      display: flex;
      gap: 10px;
      text-align: left;
    }}

    /* Navigation Controls */
    .nav-controls {{
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 20px;
    }}

    .nav-btn {{
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--charcoal);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      font-weight: 700;
      transition: all 0.2s ease;
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    }}

    .nav-btn:hover {{
      background: var(--accent);
      color: white;
      border-color: var(--accent);
      transform: scale(1.05);
    }}

    .dots-indicator {{
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      max-width: 460px;
      gap: 6px;
    }}

    .dot-pill {{
      width: 8px;
      height: 8px;
      border-radius: 8px;
      background: var(--border);
      cursor: pointer;
      transition: all 0.3s ease;
    }}

    .dot-pill.active {{
      width: 22px;
      background: var(--accent);
    }}

    /* Grid View Mode */
    .grid-view {{
      display: none;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      width: 100%;
      max-width: 1120px;
      margin-top: 20px;
    }}

    .grid-slide {{
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 18px;
      height: 380px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
      box-shadow: 0 6px 18px rgba(0,0,0,0.04);
      cursor: pointer;
      transition: all 0.2s ease;
    }}

    .grid-slide:hover {{
      transform: translateY(-4px);
      box-shadow: 0 10px 24px rgba(0,0,0,0.08);
      border-color: var(--accent);
    }}

    /* Image Showcase Gallery */
    .image-showcase {{
      display: none;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 20px;
      width: 100%;
      max-width: 1120px;
      margin-top: 20px;
    }}

    .image-card {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.04);
      transition: all 0.2s;
    }}

    .image-card:hover {{ transform: translateY(-3px); }}
    .image-card img {{ width: 100%; height: 210px; object-fit: cover; object-position: top center; background: #FAFAF7; display: block; border-bottom: 1px solid var(--border); }}
    .image-card-caption {{
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}

    /* Modal for LinkedIn Post Copy */
    .modal-backdrop {{
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      backdrop-filter: blur(4px);
      z-index: 100;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }}

    .modal-window {{
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 24px;
      max-width: 680px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      padding: 28px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.2);
      position: relative;
    }}

    /* PRINT STYLES FOR PDF GENERATION (1080x1080 Square Slide Per Page) */
    @page {{
      size: 1080px 1080px;
      margin: 0;
    }}

    @media print {{
      html, body {{
        background: #F9F8F3 !important;
        padding: 0 !important;
        margin: 0 !important;
      }}
      .top-bar, .nav-controls, .modal-backdrop, .grid-view, .image-showcase {{
        display: none !important;
      }}
      .carousel-container {{
        display: block !important;
        max-width: 100% !important;
        width: 1080px !important;
        margin: 0 !important;
      }}
      .slide-item {{
        display: flex !important;
        page-break-after: always !important;
        break-after: page !important;
        width: 1080px !important;
        height: 1080px !important;
        margin: 0 !important;
        box-shadow: none !important;
        border: none !important;
        border-radius: 0 !important;
        padding: 44px 50px 36px 50px !important;
        background: #F9F8F3 !important;
        box-sizing: border-box !important;
      }}
      .cover-title {{
        font-size: 58px !important;
      }}
      .screenshot-slide-title {{
        font-size: 34px !important;
        margin-bottom: 6px !important;
      }}
      .slide-subtitle {{
        font-size: 16.5px !important;
        line-height: 1.4 !important;
      }}
      .browser-card-container {{
        flex: 1 !important;
        min-height: 0 !important;
        width: 100% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        position: relative !important;
      }}
      .browser-mockup {{
        width: var(--cw-1080) !important;
        height: var(--ch-1080) !important;
        border-radius: 18px !important;
        box-shadow: 0 16px 40px rgba(0,0,0,0.07) !important;
        flex: none !important;
        margin: auto auto !important;
      }}
      .browser-topbar {{
        padding: 10px 18px !important;
        height: 42px !important;
      }}
      .b-dot {{
        width: 11px !important;
        height: 11px !important;
      }}
      .browser-address-bar {{
        font-size: 13.5px !important;
        padding: 4px 14px !important;
        max-width: 520px !important;
      }}
      .browser-live-badge {{
        font-size: 12px !important;
        padding: 3px 10px !important;
      }}
      /* VIEWPORT MATCHING EXACT IMAGE SIZE (ZERO CROP, ZERO ZOOM-OUT) */
      .browser-viewport {{
        width: var(--vw-1080) !important;
        height: var(--vh-1080) !important;
        flex: none !important;
        overflow: hidden !important;
      }}
      .screenshot-img {{
        width: 100% !important;
        height: 100% !important;
        object-fit: fill !important;
        display: block !important;
      }}
      .doodle-note-pill {{
        font-size: 13px !important;
        padding: 5px 14px !important;
      }}
      .slide-tag {{
        font-size: 13px !important;
        padding: 6px 15px !important;
      }}
      .slide-page-num {{
        font-size: 13px !important;
        padding: 5px 12px !important;
      }}
      .slide-footer {{
        font-size: 13px !important;
        padding-top: 12px !important;
      }}
      .slide-author, .slide-swipe-hint {{
        font-size: 13px !important;
      }}
    }}
  </style>
</head>
<body>

  <!-- Top Action Bar -->
  <header class="top-bar">
    <div class="brand-group">
      <div class="brand-logo-badge">A</div>
      <div>
        <h1 class="brand-title">Awaastech — Complete Platform Tour</h1>
        <p class="brand-subtitle">Organized by System Menu Tabs • From Public Landing to Analytics ({TOTAL_SLIDES} Slides)</p>
      </div>
    </div>
    <div class="actions-group">
      <div class="tab-buttons" style="display: flex; gap: 8px;">
        <button class="btn" id="btnCarouselTab" onclick="switchView('carousel')">Slideshow</button>
        <button class="btn" id="btnGridTab" onclick="switchView('grid')">All {TOTAL_SLIDES} Slides</button>
        <button class="btn" id="btnImagesTab" onclick="switchView('images')">Original Screenshots</button>
      </div>
      <a href="Awaastech-LinkedIn-Carousel.pdf" download="Awaastech-LinkedIn-Carousel.pdf" class="btn btn-primary">
        📄 Download Ready PDF
      </a>
      <button class="btn btn-olive" onclick="openLinkedInPostModal()">📋 Copy Post Caption</button>
    </div>
  </header>

  <!-- Carousel View Mode -->
  <div class="carousel-container" id="carouselContainer">
    
{all_slides_html_str}

    <!-- Navigation Bar -->
    <div class="nav-controls" id="navControls">
      <button class="nav-btn" onclick="prevSlide()" title="Previous slide (←)">‹</button>
      <div class="dots-indicator" id="dotsIndicator"></div>
      <button class="nav-btn" onclick="nextSlide()" title="Next slide (→)">›</button>
    </div>

  </div>

  <!-- Grid View Mode (All Slides) -->
  <div class="grid-view" id="gridView"></div>

  <!-- Raw Screenshots Showcase -->
  <div class="image-showcase" id="imageShowcase">
{gallery_html_str}
  </div>

  <!-- Modal for LinkedIn Post Copy -->
  <div class="modal-backdrop" id="linkedInModal" onclick="if(event.target === this) closeLinkedInPostModal()">
    <div class="modal-window">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
        <h3 style="font-family: 'Cormorant Garamond', serif; font-size: 24px; color: var(--charcoal);">
          📋 LinkedIn Post Caption
        </h3>
        <button onclick="closeLinkedInPostModal()" style="border: none; background: none; font-size: 20px; cursor: pointer; color: var(--muted);">&times;</button>
      </div>
      <p style="font-size: 13px; color: var(--muted); margin-bottom: 14px;">
        Ready to share with your carousel PDF on LinkedIn:
      </p>
      <textarea id="captionTextarea" readonly style="width: 100%; height: 260px; padding: 14px; font-family: 'Outfit', sans-serif; font-size: 13px; border: 1px solid var(--border); border-radius: 12px; background: #FAFAF7; color: var(--charcoal); resize: vertical; line-height: 1.5; margin-bottom: 16px;">🚀 Inside Awaastech — The Next-Gen Housing Society ERP (Live 22-Slide Tour by Menu Tabs) 🏙️✨

Managing modern residential societies requires micro-city governance. From maintenance fee collisions to manual gate logs and paper meeting minutes, fragmented tools cause operational friction.

Here is the complete live product walkthrough inside Awaastech, structured exactly around our 16 core menu modules:

🔹 Public Landing &amp; Onboarding: Conversion-optimized hero, self-service society setup, two-factor OTP verification, and role-based login.
🔹 Menu Tab 01 — Overview: Real-time collections, active announcements, and pending grievance counters.
🔹 Menu Tab 02 — My Profile: Bank account setup, audit trails, and strict RBAC permission matrix.
🔹 Menu Tab 03 — Member Registry: Tower wing directory, flat ledger, and verified owner vs. tenant records.
🔹 Menu Tab 04 — Notice Board: Emergency circulars and community broadcasts with instant push notifications.
🔹 Menu Tab 05 — Global Meetings: Committee &amp; AGM scheduling, quorum tracking, and certified minutes.
🔹 Menu Tab 06 — Billing System: Automated bulk invoices protected by Redis Lua distributed locks.
🔹 Menu Tab 07 — Complaints: LangGraph AI-assisted dispute reconciliation &amp; category-based SLA tracking.
🔹 Menu Tab 08 — Parcel Gate Locker: Secure 4-digit claim PINs for Swiggy, Amazon &amp; courier handoffs.
🔹 Menu Tab 09 — Domestic Staff Directory: Maids, drivers &amp; security gate passes with biometric timestamps.
🔹 Menu Tab 10 — Facility Bookings: Conflict-free clubhouse, pool &amp; court reservations with concurrency locks.
🔹 Menu Tab 11 — Digital AGM &amp; Voting: 1-flat-1-vote tamper-evident ballots and real-time verifiable poll counts.
🔹 Menu Tab 12 — Tally &amp; Accounting: Double-entry ledger, journal entries, cashbooks, and 1-click Tally export.
🔹 Menu Tab 13 — Green Sustainability: Solar generation telemetry, rainwater sensors, and ESG carbon scorecards.
🔹 Menu Tab 14 — WhatsApp Bot Simulator: Direct conversational concierge without requiring an app download.
🔹 Menu Tab 15 — White-Label Theme: Bespoke color palettes, dark modes, and community branding.
🔹 Menu Tab 16 — Analytics Reports: Collection velocity, occupancy trends, and predictive financial insights.

💡 Engineering Takeaway: Real-world society operations demand distributed locks, geofenced escrow, idempotent webhooks, and granular RBAC.

⭐ Open source on GitHub: https://github.com/SuyashShinde10/society-management-system
🌐 Live deployment: https://awaastech.vercel.app

What feature would your housing society benefit from the most? Drop your thoughts below! 👇

#SystemDesign #WebDevelopment #ReactJS #NodeJS #FullStack #SoftwareEngineering #HousingSociety #ERP #OpenSource #TechCommunity</textarea>
      <div style="display: flex; justify-content: flex-end; gap: 10px;">
        <button class="btn" onclick="closeLinkedInPostModal()">Close</button>
        <button class="btn btn-primary" onclick="copyCaptionToClipboard()">📋 Copy Caption</button>
      </div>
    </div>
  </div>

  <script>
    const totalSlides = {TOTAL_SLIDES};
    let currentSlide = 1;

    function initDots() {{
      const indicator = document.getElementById('dotsIndicator');
      indicator.innerHTML = '';
      for (let i = 1; i <= totalSlides; i++) {{
        const dot = document.createElement('span');
        dot.className = 'dot-pill' + (i === 1 ? ' active' : '');
        dot.title = 'Slide ' + i;
        dot.onclick = () => showSlide(i);
        indicator.appendChild(dot);
      }}
    }}

    function showSlide(num) {{
      if (num < 1) num = 1;
      if (num > totalSlides) num = totalSlides;

      for (let i = 1; i <= totalSlides; i++) {{
        const el = document.getElementById(`slide-${{i}}`);
        if (el) {{
          el.style.display = (i === num) ? 'flex' : 'none';
        }}
      }}

      currentSlide = num;

      const dots = document.querySelectorAll('.dot-pill');
      dots.forEach((dot, idx) => {{
        dot.className = 'dot-pill' + (idx === num - 1 ? ' active' : '');
      }});

      window.scrollTo({{ top: 0, behavior: 'smooth' }});
    }}

    function nextSlide() {{
      if (currentSlide < totalSlides) {{
        showSlide(currentSlide + 1);
      }} else {{
        showSlide(1);
      }}
    }}

    function prevSlide() {{
      if (currentSlide > 1) {{
        showSlide(currentSlide - 1);
      }} else {{
        showSlide(totalSlides);
      }}
    }}

    document.addEventListener('keydown', (e) => {{
      if (e.key === 'ArrowRight' || e.key === ' ') {{
        nextSlide();
      }} else if (e.key === 'ArrowLeft') {{
        prevSlide();
      }}
    }});

    function switchView(mode) {{
      const carouselEl = document.getElementById('carouselContainer');
      const gridEl = document.getElementById('gridView');
      const imagesEl = document.getElementById('imageShowcase');

      document.getElementById('btnCarouselTab').style.background = mode === 'carousel' ? 'var(--charcoal)' : 'var(--surface)';
      document.getElementById('btnCarouselTab').style.color = mode === 'carousel' ? 'white' : 'var(--charcoal)';
      document.getElementById('btnGridTab').style.background = mode === 'grid' ? 'var(--charcoal)' : 'var(--surface)';
      document.getElementById('btnGridTab').style.color = mode === 'grid' ? 'white' : 'var(--charcoal)';
      document.getElementById('btnImagesTab').style.background = mode === 'images' ? 'var(--charcoal)' : 'var(--surface)';
      document.getElementById('btnImagesTab').style.color = mode === 'images' ? 'white' : 'var(--charcoal)';

      if (mode === 'carousel') {{
        carouselEl.style.display = 'flex';
        gridEl.style.display = 'none';
        imagesEl.style.display = 'none';
        showSlide(currentSlide);
      }} else if (mode === 'grid') {{
        carouselEl.style.display = 'none';
        imagesEl.style.display = 'none';
        gridEl.style.display = 'grid';
        populateGridView();
      }} else if (mode === 'images') {{
        carouselEl.style.display = 'none';
        gridEl.style.display = 'none';
        imagesEl.style.display = 'grid';
      }}
    }}

    function populateGridView() {{
      const gridEl = document.getElementById('gridView');
      gridEl.innerHTML = '';
      for (let i = 1; i <= totalSlides; i++) {{
        const orig = document.getElementById(`slide-${{i}}`);
        if (orig) {{
          const clone = orig.cloneNode(true);
          clone.id = `grid-slide-${{i}}`;
          clone.className = 'grid-slide';
          clone.style.display = 'flex';
          clone.onclick = () => {{
            switchView('carousel');
            showSlide(i);
          }};
          gridEl.appendChild(clone);
        }}
      }}
    }}

    function openLinkedInPostModal() {{
      document.getElementById('linkedInModal').style.display = 'flex';
    }}

    function closeLinkedInPostModal() {{
      document.getElementById('linkedInModal').style.display = 'none';
    }}

    function copyCaptionToClipboard() {{
      const copyText = document.getElementById("captionTextarea");
      copyText.select();
      copyText.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(copyText.value).then(() => {{
        alert("Official LinkedIn launch caption copied to clipboard!");
      }});
    }}

    initDots();
    switchView('carousel');
  </script>
</body>
</html>
'''
    return full_html

if __name__ == "__main__":
    html_out = os.path.join(CAROUSEL_DIR, "index.html")
    content = generate_html()
    with open(html_out, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated {html_out} with {TOTAL_SLIDES} slides successfully!")
