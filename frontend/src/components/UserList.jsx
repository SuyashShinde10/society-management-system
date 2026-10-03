import React, { useEffect, useState, useContext } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { Users, Search, Edit2, Trash2, UserPlus, Phone, MessageCircle, X } from 'lucide-react';
import EmptyState from './ui/EmptyState';
import ComponentError from './ui/ComponentError';
import { CardsGridSkeleton } from './ui/DashboardSkeleton';
import AddMember from './AddMember';

const UserList = ({ refreshTrigger, onRefresh }) => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '', email: '', wing: '', floor: '', flatNumber: '', residentType: 'Owner', phone: '', parkingSlot: '', vehicleNumber: ''
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchUsers();
    }
  }, [user, refreshTrigger]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const { data } = await api.get(`/auth/users?_t=${Date.now()}`);
      setUsers(data);
    } catch (error) {
      console.error('// DATABASE_ACCESS_ERROR');
      setFetchError(error.response?.data?.message || 'Failed to retrieve resident registry.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (u) => {
    setEditingId(u._id);
    setEditFormData({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      parkingSlot: u.parkingSlot || '',
      vehicleNumber: u.vehicleNumber || '',
      wing: u.flatDetails?.wing || '',
      floor: u.flatDetails?.floor || '',
      flatNumber: u.flatDetails?.flatNumber || '',
      residentType: u.flatDetails?.residentType || 'Owner',
    });
  };

  const handleCancel = () => setEditingId(null);

  const handleSave = async (id) => {
    try {
      await api.put(`/auth/user/${id}`, editFormData);
      setEditingId(null);
      fetchUsers();
      toast.success('Member record updated.');
    } catch (error) {
      toast.error('Failed to update member. Please try again.');
    }
  };

  const handleDelete = async (id, name) => {
    toast(`Remove resident ${name || ''}?`, {
      description: 'This will archive their resident profile.',
      action: {
        label: 'Confirm Remove',
        onClick: async () => {
          try {
            await api.delete(`/auth/user/${id}`);
            setUsers(prev => prev.filter((u) => u._id !== id));
            toast.success('Resident removed from registry.');
          } catch (error) {
            toast.error('Failed to delete member.');
          }
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  const displayedUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.flatDetails?.flatNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.flatDetails?.wing || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "'Outfit', sans-serif" }} className="w-full">
      {/* Header with Title, Search and Onboard CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 mb-6 border-b border-[#E8E4D9]">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF7ED] border border-[#FED7AA] flex items-center justify-center shrink-0">
            <Users size={24} className="text-[#EA580C]" />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-semibold m-0 text-[#2C2C2C]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Resident Registry
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 m-0 mt-0.5">
              Managing <strong className="text-slate-800 tabular-nums">{users.length}</strong> registered society members
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search by name, flat, wing..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="organic-input w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-[#D9734E] hover:bg-[#c2623e] active:scale-95 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-sm shrink-0"
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Onboard Resident</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <CardsGridSkeleton count={6} />
      ) : fetchError ? (
        <ComponentError title="Failed to load resident registry" error={fetchError} onRetry={fetchUsers} />
      ) : displayedUsers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Residents Found"
          description={searchQuery ? "No members match your search criteria. Try a different search term." : "No registered members currently in the directory."}
          actionLabel="Onboard New Resident"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedUsers.map((u) => (
            <div
              key={u._id}
              className="border border-[#E8E4D9] bg-white rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              {editingId === u._id ? (
                <div className="flex flex-col gap-3">
                  <div className="text-sm font-bold text-slate-900">Editing Record</div>
                  <input value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} placeholder="Full Name" className="organic-input text-xs py-2 rounded-lg" />
                  <input value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} placeholder="Email Address" className="organic-input text-xs py-2 rounded-lg" />
                  <input value={editFormData.phone} onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })} placeholder="Phone Number" className="organic-input text-xs py-2 rounded-lg" />
                  <div className="grid grid-cols-3 gap-2">
                    <input value={editFormData.wing} onChange={(e) => setEditFormData({ ...editFormData, wing: e.target.value })} placeholder="Wing" className="organic-input text-xs py-2 rounded-lg" />
                    <input value={editFormData.floor} onChange={(e) => setEditFormData({ ...editFormData, floor: e.target.value })} placeholder="Floor" className="organic-input text-xs py-2 rounded-lg" />
                    <input value={editFormData.flatNumber} onChange={(e) => setEditFormData({ ...editFormData, flatNumber: e.target.value })} placeholder="Unit" className="organic-input text-xs py-2 rounded-lg" />
                  </div>
                  <select value={editFormData.residentType} onChange={(e) => setEditFormData({ ...editFormData, residentType: e.target.value })} className="organic-input text-xs py-2 rounded-lg">
                    <option value="Owner">Owner</option>
                    <option value="Tenant">Tenant</option>
                  </select>
                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleSave(u._id)} className="flex-1 py-2 rounded-xl text-xs font-semibold bg-[#2C2C2C] text-white">Save Changes</button>
                    <button onClick={handleCancel} className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Top Bar: Initial Avatar + Status & Flat Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl bg-[#F4F1EA] text-[#2C2C2C] border border-[#E8E4D9] flex items-center justify-center font-bold text-lg shrink-0">
                        {u.name ? u.name.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="min-w-0">
                        <h4 className="m-0 text-base font-bold text-slate-900 truncate">{u.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-semibold text-[#D9734E] tabular-nums">
                            {u.flatDetails ? `Wing ${u.flatDetails.wing}-${u.flatDetails.flatNumber}` : 'Unassigned'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                      u.flatDetails?.residentType === 'Tenant'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {u.flatDetails?.residentType || 'Owner'}
                    </span>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs text-slate-600 bg-[#FAF9F6] p-2.5 rounded-xl border border-slate-100">
                    <p className="m-0 truncate"><span className="text-slate-400">Email:</span> {u.email}</p>
                    {u.phone && (
                      <p className="m-0 truncate tabular-nums"><span className="text-slate-400">Phone:</span> {u.phone}</p>
                    )}
                  </div>

                  {/* Actions & Instant Communication */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-auto">
                    {u.phone && (
                      <>
                        <a
                          href={`tel:${u.phone}`}
                          title={`Call ${u.name}`}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Phone size={13} className="text-emerald-600" />
                          <span>Call</span>
                        </a>
                        <a
                          href={`https://wa.me/91${u.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`WhatsApp ${u.name}`}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <MessageCircle size={13} className="text-emerald-600" />
                          <span>Chat</span>
                        </a>
                      </>
                    )}
                    <button
                      onClick={() => handleEditClick(u)}
                      title="Edit Resident"
                      className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(u._id, u.name)}
                      title="Remove Resident"
                      className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Slide-Over Modal for Onboarding Resident */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[1100] flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            />

            {/* Slide-in Sheet */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-[#E8E4D9] flex items-center justify-between bg-[#FDFCF9]">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 m-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    Onboard New Resident
                  </h3>
                  <p className="text-xs text-slate-500 m-0 mt-0.5">
                    Generate credentials and assign flat allotment
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <AddMember
                  onAdd={() => {
                    setShowAddModal(false);
                    fetchUsers();
                    if (onRefresh) onRefresh();
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserList;