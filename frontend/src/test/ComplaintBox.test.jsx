import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ComplaintBox from '../components/ComplaintBox';
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

describe('ComplaintBox Component', () => {
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
      id: 'usr10',
      name: 'Rohan Mehra',
      email: 'rohan@test.com',
      role: userRole,
      societyId: 'soc1'
    };

    return render(
      <QueryClientProvider client={queryClient}>
        <AuthContext.Provider value={{ user: mockUser }}>
          <ComplaintBox />
        </AuthContext.Provider>
      </QueryClientProvider>
    );
  };

  it('renders complaints successfully from paginated API', async () => {
    api.get.mockImplementation((url) => {
      if (url.includes('/complaints')) {
        return Promise.resolve({
          data: {
            complaints: [
              {
                _id: 'c-1',
                title: 'Noisy Corridor Fan',
                description: 'The exhaust fan on 4th floor makes grinding noises.',
                status: 'Pending',
                user: { name: 'Rohan Mehra' },
                createdAt: new Date().toISOString()
              }
            ],
            total: 1,
            nextCursor: null
          }
        });
      }
      return Promise.resolve({ data: [] });
    });

    renderWithProviders('member');

    await waitFor(() => {
      expect(screen.getByText('Noisy Corridor Fan')).toBeDefined();
      expect(screen.getByText('The exhaust fan on 4th floor makes grinding noises.')).toBeDefined();
    });
  });

  it('renders EmptyState when no grievances are logged', async () => {
    api.get.mockResolvedValue({
      data: {
        complaints: [],
        total: 0,
        nextCursor: null
      }
    });

    renderWithProviders('member');

    await waitFor(() => {
      expect(screen.getByText('No incidents reported')).toBeDefined();
    });
  });
});
