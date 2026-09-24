import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MaintenanceBills from '../components/MaintenanceBills';
import AuthContext from '../context/AuthContext';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}));

describe('MaintenanceBills Component', () => {
  let queryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0
        }
      }
    });
    vi.clearAllMocks();
  });

  const renderWithProviders = (userRole = 'member') => {
    const mockUser = {
      id: 'usr1',
      name: 'Priya Sharma',
      email: 'priya@test.com',
      role: userRole,
      societyId: 'soc1'
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ user: mockUser }}>
          <MaintenanceBills />
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  it('renders bills list with proper titles and amounts', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/bills') {
        return Promise.resolve({
          data: [
            {
              _id: 'bill-1',
              title: 'March 2026 Maintenance',
              amount: 2500,
              status: 'Pending',
              isPaid: false,
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              createdAt: new Date().toISOString()
            }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });

    renderWithProviders('member');

    await waitFor(() => {
      expect(screen.getByText(/March 2026 Maintenance/)).toBeDefined();
      expect(screen.getByText(/2,500/)).toBeDefined();
    });
  });

  it('renders EmptyState when there are no bills', async () => {
    api.get.mockResolvedValue({ data: [] });

    renderWithProviders('member');

    await waitFor(() => {
      expect(screen.getByText('No maintenance bills found')).toBeDefined();
    });
  });
});
