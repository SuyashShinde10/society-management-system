import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NoticeBoard from '../components/NoticeBoard';
import AuthContext from '../context/AuthContext';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn()
  }
}));

describe('NoticeBoard Component', () => {
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
      id: '123',
      name: 'Test Resident',
      email: 'resident@test.com',
      role: userRole,
      societyId: 'soc1'
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ user: mockUser }}>
          <NoticeBoard />
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  it('renders notices returned from API', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/notices') {
        return Promise.resolve({
          data: [
            {
              _id: 'notice-1',
              title: 'Water Supply Maintenance',
              content: 'Tank cleaning scheduled for tomorrow morning.',
              createdAt: new Date().toISOString()
            }
          ]
        });
      }
      return Promise.resolve({ data: [] });
    });

    renderWithProviders('member');

    await waitFor(() => {
      expect(screen.getByText('Water Supply Maintenance')).toBeDefined();
      expect(screen.getByText('Tank cleaning scheduled for tomorrow morning.')).toBeDefined();
    });
  });

  it('renders EmptyState when no notices are found', async () => {
    api.get.mockResolvedValue({ data: [] });

    renderWithProviders('member');

    await waitFor(() => {
      expect(screen.getByText('No notices broadcasted')).toBeDefined();
      expect(screen.getByText(/There are currently no active announcements or circulars/i)).toBeDefined();
    });
  });
});
