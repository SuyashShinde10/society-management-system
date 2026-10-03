import React, { useState, useContext } from 'react';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';
import AuthContext from '../context/AuthContext';
import theme from '../theme';
import { Bell } from 'lucide-react';
import EmptyState from './ui/EmptyState';
import ComponentError from './ui/ComponentError';
import { CardsGridSkeleton } from './ui/DashboardSkeleton';
import FormError from './ui/FormError';

const NoticeBoard = () => {
  const { user } = useContext(AuthContext);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('All');
  const [targetUserId, setTargetUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [errors, setErrors] = useState({});
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryClient = useQueryClient();

  const isNew = (dateString) => {
    if (!dateString) return false;
    const diffTime = Math.abs(new Date() - new Date(dateString));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  };

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/auth/users');
      return data;
    },
    enabled: user?.role === 'admin'
  });

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      const { data } = await api.get('/notices');
      return data;
    },
    refetchInterval: 10000 // 10 seconds polling
  });

  const postMutation = useMutation({
    mutationFn: (newNotice) => api.post('/notices', newNotice),
    onSuccess: () => {
      setTitle('');
      setContent('');
      setTargetType('All');
      setTargetUserId('');
      queryClient.invalidateQueries(['notices']);
      toast.success('Notice posted successfully.');
    },
    onError: () => toast.error('Failed to post notice. Please try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/notices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['notices']);
      toast.success('Notice removed.');
    },
    onError: () => toast.error('Failed to delete notice.'),
  });

  const handlePost = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Notice headline is required.';
    } else if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }

    if (!content.trim()) {
      newErrors.content = 'Notice announcement content is required.';
    } else if (content.trim().length < 5) {
      newErrors.content = 'Content must be at least 5 characters long.';
    }

    if (targetType === 'Specific' && !targetUserId) {
      newErrors.targetUserId = 'Please select a specific member recipient.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Please check the highlighted notice fields.');
      return;
    }

    setErrors({});
    postMutation.mutate({ title: title.trim(), content: content.trim(), targetType, targetUserId });
  };

  const handleDelete = async (id) => {
    toast('Delete this notice?', {
      action: {
        label: 'Delete',
        onClick: async () => {
          deleteMutation.mutate(id);
        },
      },
      cancel: { label: 'Cancel', onClick: () => {} },
    });
  };

  const filteredNotices = notices.filter(n => 
    n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const paginatedNotices = filteredNotices.slice(0, page * limit);
  const hasMore = paginatedNotices.length < filteredNotices.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 10px' }}>
        <div style={{ background: '#F9F8F3', padding: '10px', borderRadius: '12px' }}>
          <Bell size={24} color={theme.accent} />
        </div>
        <h3 style={{ margin: 0, fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: '600', color: theme.textMain }}>
          Notice Board
        </h3>
      </div>

      <div style={{ padding: '0' }}>
        {user && user.role === 'admin' && (
          <form onSubmit={handlePost} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '30px', background: 'white', padding: '24px', borderRadius: '20px', border: `1px solid ${theme.border}`, boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '14px', fontWeight: '600', color: theme.textSec }}>Compose New Broadcast</span>
            
            <div className="flex flex-col sm:flex-row gap-2.5">
              <select 
                value={targetType} 
                onChange={e => {
                  setTargetType(e.target.value);
                  if (errors.targetUserId) setErrors(prev => ({ ...prev, targetUserId: null }));
                }} 
                className="dispatch-input"
                style={{ flex: 1, fontFamily: "'Outfit', sans-serif", border: `1px solid ${theme.border}`, background: theme.fieldBg, padding: '12px', outline: 'none', fontSize: '13px', borderRadius: '10px' }}
              >
                <option value="All">Target: All Members</option>
                <option value="Specific">Target: Specific Member</option>
              </select>

              {targetType === 'Specific' && (
                <div style={{ flex: 1 }}>
                  <select 
                    value={targetUserId} 
                    onChange={e => {
                      setTargetUserId(e.target.value);
                      if (errors.targetUserId) setErrors(prev => ({ ...prev, targetUserId: null }));
                    }} 
                    className="dispatch-input"
                    style={{ width: '100%', fontFamily: "'Outfit', sans-serif", border: `1px solid ${errors.targetUserId ? '#E11D48' : theme.border}`, background: theme.fieldBg, padding: '12px', outline: 'none', fontSize: '13px', borderRadius: '10px' }}
                  >
                    <option value="">-- Choose Member --</option>
                    {users.map(u => (
                      <option key={u._id} value={u._id}>{u.name} (Flat {u.flatDetails?.wing}-{u.flatDetails?.flatNumber})</option>
                    ))}
                  </select>
                  <FormError error={errors.targetUserId} />
                </div>
              )}
            </div>

            <div>
              <input
                placeholder="Notice Title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors(prev => ({ ...prev, title: null }));
                }}
                className="dispatch-input"
                style={{ fontFamily: "'Outfit', sans-serif", border: `1px solid ${errors.title ? '#E11D48' : theme.border}`, background: theme.fieldBg, padding: '12px', outline: 'none', fontSize: '14px', width: '100%', boxSizing: 'border-box', borderRadius: '10px' }}
              />
              <FormError error={errors.title} />
            </div>

            <div>
              <textarea
                placeholder="Write your announcement or notice here..."
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) setErrors(prev => ({ ...prev, content: null }));
                }}
                style={{ fontFamily: "'Outfit', sans-serif", border: `1px solid ${errors.content ? '#E11D48' : theme.border}`, background: theme.fieldBg, padding: '12px', outline: 'none', fontSize: '14px', minHeight: '90px', width: '100%', boxSizing: 'border-box', borderRadius: '10px' }}
              />
              <FormError error={errors.content} />
            </div>

            <button type="submit" style={{
              background: theme.accent, color: 'white', border: 'none', padding: '14px', borderRadius: '12px',
              fontFamily: "'Outfit', sans-serif", fontWeight: '600', fontSize: '15px', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(217,115,78,0.2)', transition: 'transform 0.2s'
            }} onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'} onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
              Post Notice
            </button>
          </form>
        )}

        <input 
          type="text" 
          placeholder="Search notices..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="organic-input" 
          style={{ width: '100%', padding: '12px 16px', marginBottom: '16px', boxSizing: 'border-box', fontFamily: "'Outfit', sans-serif", borderRadius: '12px' }}
        />

        <div className="flex flex-col gap-3.5 sm:gap-4 py-1">
          {isLoading ? (
            <CardsGridSkeleton count={4} />
          ) : paginatedNotices.length === 0 ? (
            <EmptyState
              type="notices"
              icon={Bell}
              title="No notices broadcasted"
              description="There are currently no active announcements or circulars on the society notice board."
            />
          ) : (
            paginatedNotices.map((n) => (
              <div 
                key={n._id} 
                className="bg-white rounded-2xl border border-[#E8E4D9] p-4 sm:p-6 shadow-sm hover:shadow-md transition-all"
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', color: theme.textMain, fontWeight: '600', display: 'flex', alignItems: 'center' }}>
                    {n.title}
                    {isNew(n.createdAt) && (
                      <span style={{
                        fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: '700',
                        background: '#10B981', color: 'white', padding: '2px 8px', borderRadius: '12px', marginLeft: '10px'
                      }}>NEW</span>
                    )}
                  </h4>
                  {user?.role === 'admin' && (
                    <button 
                      onClick={() => handleDelete(n._id)} 
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-bold transition-colors"
                      title="Delete Notice"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p style={{ margin: 0, fontFamily: "'Outfit', sans-serif", fontSize: '13px', color: theme.textSec, lineHeight: '1.4' }}>
                  {n.content}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px', alignItems: 'center' }}>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '10px', fontWeight: '700', background: '#E8E8E8', padding: '2px 6px' }}>
                    DATE: {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: "'Outfit', sans-serif", opacity: 0.4 }}>
                    ID: {n._id.substring(0, 8)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        
        {hasMore && (
          <button onClick={() => setPage(page + 1)} style={{ width: '100%', marginTop: '20px', padding: '12px', background: 'white', borderRadius: '12px', border: `1px dashed ${theme.border}`, color: theme.textMain, fontFamily: "'Outfit', sans-serif", fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s' }} onMouseOver={(e) => e.target.style.background = '#F9F8F3'} onMouseOut={(e) => e.target.style.background = 'white'}>
            Load More Records
          </button>
        )}
      </div>
    </div>
  );
};

export default NoticeBoard;