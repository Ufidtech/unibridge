import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * React hook to auto-logout and redirect to login page if token is expired or invalid.
 * Usage: Call useAutoLogout() in your top-level App component.
 */
export default function useAutoLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    // Patch fetch to catch 401 errors globally
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        // Remove tokens and user data
        localStorage.removeItem('idToken');
        localStorage.removeItem('menteeData');
        localStorage.removeItem('mentorData');
        localStorage.removeItem('currentPage');
        sessionStorage.clear();
        // Redirect to login
        navigate('/login', { replace: true });
        return response;
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, [navigate]);
}
