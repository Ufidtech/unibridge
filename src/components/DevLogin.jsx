import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Dev helper: registers a dev mentee with backend, seeds localStorage with returned token/user,
// then redirects to mentee dashboard. This keeps frontend auth consistent with backend mock.
export default function DevLogin() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    async function registerDev() {
      try {
        const now = Date.now();
        const email = `dev-mentee-${now}@example.com`;
        const payload = {
          name: 'Dev Mentee',
          email,
          password: 'devpass123',
          school: 'Dev HS',
          classLevel: 'SS3',
        };

        // call backend register endpoint
        const res = await fetch('/api/auth/register/mentee', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          // fallback to local-only seed
          throw new Error('backend register failed');
        }

        const data = await res.json();
        const user = data.user;
        const token = data.customToken;

        if (mounted) {
          localStorage.setItem('idToken', token || `mock:${user?.uid || 'dev'}`);
          localStorage.setItem('menteeData', JSON.stringify(user || { name: 'Dev Mentee', id: user?.uid }));
          localStorage.setItem('currentPage', '/mentee-dashboard');
          setTimeout(() => navigate('/mentee-dashboard'), 200);
        }
      } catch (e) {
        // fallback: seed only frontend-local data
        try {
          const now = Date.now();
          const user = {
            uid: `dev-mentee-${now}`,
            id: `dev-mentee-${now}`,
            name: 'Dev Mentee',
            email: `dev-mentee-${now}@example.com`,
            role: 'MENTEE',
            menteeProfile: { school: 'Dev HS', classLevel: 'SS3', dreamCourse: 'Computer Science' },
          };
          localStorage.setItem('idToken', `mock:${user.uid}`);
          localStorage.setItem('menteeData', JSON.stringify(user));
          localStorage.setItem('currentPage', '/mentee-dashboard');
        } catch (e2) {
          // ignore
        }
        if (mounted) setTimeout(() => navigate('/mentee-dashboard'), 200);
      }
    }

    registerDev();

    return () => { mounted = false; };
  }, [navigate]);

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold">Dev login: registering and seeding credentials...</h2>
      <p className="text-slate-400">You will be redirected to the mentee dashboard shortly.</p>
    </div>
  );
}
