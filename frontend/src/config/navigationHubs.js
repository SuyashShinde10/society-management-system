import {
  LayoutDashboard,
  Users,
  ReceiptText,
  Bell,
  MessageSquareWarning,
  Calendar,
  Wallet,
  ShieldCheck,
  Briefcase,
  Package,
  QrCode,
  Radio,
  Sparkles,
  Tag,
  Vote,
  Leaf,
  Landmark,
  MessageCircle,
  PieChart,
  Palette,
  User,
  Bot,
  MapPin,
  ShieldAlert,
  Cpu
} from 'lucide-react';

/**
 * 4-Hub Navigation Architecture:
 * Reduces cognitive friction by grouping 18 modules into 4 human-centric hubs:
 * 1. 🏠 Core Residence / Operations
 * 2. 🛡️ Gate & Security
 * 3. 💳 Accounts & Finance
 * 4. 🌿 Community & Lifestyle
 */

export const ADMIN_HUBS = [
  {
    category: 'Core Operations',
    tag: 'Essential',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'registry', label: 'Member Registry', icon: Users },
      { id: 'notices', label: 'Notices & Circulars', icon: Bell },
      { id: 'meetings', label: 'Global Meetings', icon: Calendar },
      { id: 'complaints', label: 'Complaints / Helpdesk', icon: MessageSquareWarning },
    ]
  },
  {
    category: 'Gate & Security',
    tag: 'Access',
    items: [
      { id: 'visitors', label: 'Visitor Logs', icon: ShieldCheck },
      { id: 'security-staff', label: 'Security Staff', icon: Briefcase },
      { id: 'parcels', label: 'Parcel Gate Locker', icon: Package },
      { id: 'staff-dir', label: 'Domestic Staff Directory', icon: Users },
      { id: 'parking', label: 'Smart Parking', icon: MapPin },
      { id: 'emergency', label: 'Emergency Protocol', icon: ShieldAlert },
    ]
  },
  {
    category: 'Accounts & Finance',
    tag: 'Financial',
    items: [
      { id: 'bills', label: 'Billing System', icon: ReceiptText },
      { id: 'expenses', label: 'Society Expenses', icon: Wallet },
      { id: 'accounting', label: 'Tally & Accounting', icon: Landmark },
      { id: 'escrow', label: 'Escrow & Projects', icon: Landmark },
      { id: 'vendors', label: 'Vendor Projects', icon: Briefcase },
    ]
  },
  {
    category: 'Lifestyle & Governance',
    tag: 'Ecosystem',
    items: [
      { id: 'amenities', label: 'Facility Bookings', icon: Sparkles },
      { id: 'agm', label: 'Digital AGM & Voting', icon: Vote },
      { id: 'sustainability', label: 'Green Sustainability', icon: Leaf },
      { id: 'iot', label: 'IoT Metering', icon: Cpu },
      { id: 'whatsapp', label: 'WhatsApp Simulator', icon: MessageCircle },
      { id: 'analytics', label: 'Analytics Reports', icon: PieChart },
      { id: 'theme', label: 'White-Label Theme', icon: Palette },
      { id: 'profile', label: 'My Profile', icon: User },
    ]
  }
];

export const MEMBER_HUBS = [
  {
    category: 'Core Residence',
    tag: 'Daily',
    items: [
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'notices', label: 'Notice Board', icon: Bell },
      { id: 'meetings', label: 'Global Meetings', icon: Calendar },
      { id: 'complaints', label: 'Complaints / Helpdesk', icon: MessageSquareWarning },
    ]
  },
  {
    category: 'Gate & Security',
    tag: 'Security',
    items: [
      { id: 'passes', label: 'Guest Passes (QR)', icon: QrCode },
      { id: 'parcels', label: 'Gate Parcels', icon: Package },
      { id: 'staff', label: 'Domestic Staff', icon: Users },
      { id: 'intercom', label: 'Guard Intercom', icon: Radio },
    ]
  },
  {
    category: 'Finance & Dues',
    tag: 'Billing',
    items: [
      { id: 'bills', label: 'My Maintenance Bills', icon: ReceiptText },
      { id: 'expenses', label: 'Society Expenses', icon: Wallet },
    ]
  },
  {
    category: 'Community & Lifestyle',
    tag: 'Lifestyle',
    items: [
      { id: 'amenities', label: 'Facility Bookings', icon: Sparkles },
      { id: 'classifieds', label: 'Classifieds & Carpool', icon: Tag },
      { id: 'agm', label: 'Digital AGM Voting', icon: Vote },
      { id: 'offers', label: 'Local Offers', icon: Tag },
      { id: 'chatbot', label: 'AI Concierge', icon: Bot },
      { id: 'whatsapp', label: 'WhatsApp Bot', icon: MessageCircle },
      { id: 'analytics', label: 'Financial Analytics', icon: PieChart },
      { id: 'profile', label: 'My Profile', icon: User },
    ]
  }
];
