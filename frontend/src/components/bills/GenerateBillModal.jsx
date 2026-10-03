import React, { useState } from 'react';
import theme from '../../theme';
import { validateAmount, validateDueDate, validateRequiredText } from '../../utils/validators';
import BottomSheet from '../ui/BottomSheet';
import FormError from '../ui/FormError';

export const GenerateBillModal = ({
  users = [],
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    dueDate: '',
    targetType: 'All',
    targetUserId: '',
  });

  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const titleError = validateRequiredText(formData.title, 'Bill Title', 3);
    const amountError = validateAmount(formData.amount, 1);
    const dateError = validateDueDate(formData.dueDate);
    let targetError = null;
    if (formData.targetType === 'Specific' && !formData.targetUserId) {
      targetError = 'Please select a specific resident.';
    }

    if (titleError || amountError || dateError || targetError) {
      setErrors({
        title: titleError,
        amount: amountError,
        dueDate: dateError,
        targetUserId: targetError,
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Maintenance Bill"
      subtitle="Issue dues to individual residents or entire society"
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', marginBottom: '6px', color: theme.textMain }}>
              Bill Title *
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Monthly Maintenance - October 2026"
              value={formData.title}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: `1px solid ${errors.title ? theme.declined : theme.border}`,
                fontFamily: "'Outfit', sans-serif",
                boxSizing: 'border-box',
              }}
            />
            {errors.title && <FormError error={errors.title} />}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', marginBottom: '6px', color: theme.textMain }}>
                Amount (₹) *
              </label>
              <input
                type="number"
                name="amount"
                placeholder="2500"
                value={formData.amount}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.amount ? theme.declined : theme.border}`,
                  fontFamily: "'Outfit', sans-serif",
                  boxSizing: 'border-box',
                }}
              />
              {errors.amount && <FormError error={errors.amount} />}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', marginBottom: '6px', color: theme.textMain }}>
                Due Date *
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.dueDate ? theme.declined : theme.border}`,
                  fontFamily: "'Outfit', sans-serif",
                  boxSizing: 'border-box',
                }}
              />
              {errors.dueDate && <FormError error={errors.dueDate} />}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', marginBottom: '6px', color: theme.textMain }}>
              Target Resident
            </label>
            <select
              name="targetType"
              value={formData.targetType}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: `1px solid ${theme.border}`,
                fontFamily: "'Outfit', sans-serif",
                background: 'white',
                boxSizing: 'border-box',
              }}
            >
              <option value="All">All Active Society Residents</option>
              <option value="Specific">Specific Member Only</option>
            </select>
          </div>

          {formData.targetType === 'Specific' && (
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', marginBottom: '6px', color: theme.textMain }}>
                Select Member *
              </label>
              <select
                name="targetUserId"
                value={formData.targetUserId}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  border: `1px solid ${errors.targetUserId ? theme.declined : theme.border}`,
                  fontFamily: "'Outfit', sans-serif",
                  background: 'white',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">-- Choose Member --</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name} ({u.flatDetails?.wing ? `Wing ${u.flatDetails.wing} ` : ''}Flat {u.flatDetails?.flatNumber || ''})
                  </option>
                ))}
              </select>
              {errors.targetUserId && <FormError error={errors.targetUserId} />}
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontFamily: "'Outfit', sans-serif", fontWeight: '600', marginBottom: '6px', color: theme.textMain }}>
              Description (Optional)
            </label>
            <textarea
              name="description"
              rows={3}
              placeholder="Additional billing details, penalty terms, or breakdown..."
              value={formData.description}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: `1px solid ${theme.border}`,
                fontFamily: "'Outfit', sans-serif",
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#F3F4F6',
                color: theme.textMain,
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                background: theme.accent,
                color: 'white',
                border: 'none',
                padding: '10px 22px',
                borderRadius: '10px',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Generating...' : 'Issue Bills'}
            </button>
          </div>
        </form>
    </BottomSheet>
  );
};

export default GenerateBillModal;
