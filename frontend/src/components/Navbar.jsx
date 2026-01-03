import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={{ padding: '10px 20px', background: '#333', color: '#fff', display: 'flex', justifyContent: 'space-between' }}>
      <h2>Society Manager</h2>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: '15px' }}>Hello, {user.name} ({user.role})</span>
            <button onClick={handleLogout} style={{ background: 'red', color: 'white', border: 'none', padding: '5px 10px', cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#fff', marginRight: '15px', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;