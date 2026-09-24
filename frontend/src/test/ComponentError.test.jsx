import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ComponentError from '../components/ui/ComponentError';

describe('ComponentError Component', () => {
  it('renders default error message', () => {
    render(<ComponentError />);
    expect(screen.getByText('Failed to load content')).toBeDefined();
  });

  it('renders custom error and handles retry click', () => {
    const handleRetry = vi.fn();
    render(
      <ComponentError
        title="Network Disconnected"
        message="Could not connect to society server."
        onRetry={handleRetry}
      />
    );

    expect(screen.getByText('Network Disconnected')).toBeDefined();
    expect(screen.getByText('Could not connect to society server.')).toBeDefined();

    const retryBtn = screen.getByText('Retry');
    fireEvent.click(retryBtn);
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });
});
