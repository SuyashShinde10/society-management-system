import React, { useContext } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AuthContext, { AuthProvider } from '../context/AuthContext';
import api from '../api';

vi.mock('../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

const TestConsumer = () => {
  const { user, loading, logout, login } = useContext(AuthContext);

  if (loading) return <div>Loading Auth...</div>;
  if (!user) return (
    <div>
      <span>Not logged in</span>
      <button onClick={() => login('admin@test.com', 'pass123')}>Do Login</button>
    </div>
  );

  return (
    <div>
      <span>Logged in as: {user.name}</span>
      <span>Role: {user.role}</span>
      <button onClick={logout}>Sign Out</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('restores authenticated user on mount via cookie auth/me endpoint', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          data: {
            user: { id: 'u1', name: 'Vikram Rao', role: 'admin' }
          }
        });
      }
      if (url === '/theme') {
        return Promise.resolve({ data: {} });
      }
      return Promise.resolve({ data: {} });
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Logged in as: Vikram Rao')).toBeDefined();
      expect(screen.getByText('Role: admin')).toBeDefined();
    });
  });

  it('renders unauthenticated state when auth/me fails (no session cookie)', async () => {
    api.get.mockRejectedValue({ response: { status: 401 } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeDefined();
    });
  });

  it('handles logout by calling backend endpoint and resetting user state', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/auth/me') {
        return Promise.resolve({
          data: {
            user: { id: 'u1', name: 'Vikram Rao', role: 'admin' }
          }
        });
      }
      return Promise.resolve({ data: {} });
    });
    api.post.mockResolvedValue({ data: { message: 'Logged out' } });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Logged in as: Vikram Rao')).toBeDefined();
    });

    const logoutBtn = screen.getByText('Sign Out');
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(screen.getByText('Not logged in')).toBeDefined();
    });
  });
});
