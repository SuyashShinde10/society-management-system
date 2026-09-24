import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EmptyState from '../components/ui/EmptyState';
import { Bell } from 'lucide-react';

describe('EmptyState Component', () => {
  it('renders title and description properly', () => {
    render(
      <EmptyState
        title="No items found"
        description="Please check back later."
      />
    );

    expect(screen.getByText('No items found')).toBeDefined();
    expect(screen.getByText('Please check back later.')).toBeDefined();
  });

  it('renders optional action button and fires onClick callback', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        icon={Bell}
        title="No notices"
        description="Broadcast list is empty"
        actionLabel="Create Notice"
        onAction={handleAction}
      />
    );

    const button = screen.getByText('Create Notice');
    expect(button).toBeDefined();
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
