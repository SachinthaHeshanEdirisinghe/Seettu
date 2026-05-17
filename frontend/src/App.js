import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './MobiCircle.css';
import { API_URL, AUTH_API_URL, AUTH_SESSION_KEY } from './constants';
import CreateGroupPage from './pages/CreateGroupPage';
import HomePage from './pages/HomePage';
import { getErrorMessage } from './utils';

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('signin');
  const [authUser, setAuthUser] = useState(() => sessionStorage.getItem(AUTH_SESSION_KEY) || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authForm, setAuthForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
  });
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [addingMemberId, setAddingMemberId] = useState(null);
  const [memberDrafts, setMemberDrafts] = useState({});
  const [theme, setTheme] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const fetchCurrentUser = useCallback(async (email) => {
    if (!email) {
      setCurrentUser(null);
      return;
    }
    try {
      const { data } = await axios.get(`${AUTH_API_URL}/me`, { params: { email } });
      setCurrentUser(data.user || null);
    } catch {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      setAuthUser('');
      setCurrentUser(null);
    }
  }, []);

  const fetchGroups = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL);
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      setGroups([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authUser) {
      fetchCurrentUser(authUser);
      fetchGroups();
    } else {
      setCurrentUser(null);
      setGroups([]);
      setLoading(false);
    }
  }, [authUser, fetchCurrentUser, fetchGroups]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessMessage(null);

    const email = authForm.email.trim().toLowerCase();
    const password = authForm.password.trim();
    const name = authForm.name.trim();
    const phone = authForm.phone.trim();

    if (!email || !password || (authMode === 'signup' && (!name || !phone))) {
      setAuthError('Please fill all required fields.');
      return;
    }

    setAuthSubmitting(true);
    try {
      const endpoint = authMode === 'signup' ? '/signup' : '/signin';
      const payload =
        authMode === 'signup' ? { name, phone, email, password } : { email, password };
      const { data } = await axios.post(`${AUTH_API_URL}${endpoint}`, payload);

      const user = data.user;
      sessionStorage.setItem(AUTH_SESSION_KEY, user.email);
      setAuthUser(user.email);
      setCurrentUser(user);
      setSuccessMessage(authMode === 'signup' ? 'Account created successfully.' : 'Signed in successfully.');
      setAuthForm({ name: '', phone: '', email: '', password: '' });
    } catch (err) {
      setAuthError(getErrorMessage(err));
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    setAuthUser('');
    setCurrentUser(null);
    setAuthMode('signin');
    setAuthForm({ name: '', phone: '', email: '', password: '' });
    setGroups([]);
    setAddingMemberId(null);
    setMemberDrafts({});
    setError(null);
    setSuccessMessage(null);
    navigate('/');
  };

  const handleDelete = async (id) => {
    setError(null);
    setSuccessMessage(null);
    try {
      await axios.delete(`${API_URL}/${id}?requesterEmail=${encodeURIComponent(currentUser?.email || '')}`);
      setSuccessMessage('Group removed.');
      setGroups((prev) => prev.filter((g) => g._id !== id));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const toggleAddMemberForm = (groupId) => {
    setAddingMemberId((prev) => (prev === groupId ? null : groupId));
    setMemberDrafts((prev) => ({
      ...prev,
      [groupId]: prev[groupId] || { name: '', phone: '' },
    }));
  };

  const handleExistingMemberDraftChange = (groupId, field, value) => {
    setMemberDrafts((prev) => ({
      ...prev,
      [groupId]: {
        ...(prev[groupId] || { name: '', phone: '' }),
        [field]: value,
      },
    }));
  };

  const handleAddMemberToGroup = async (groupId) => {
    const draft = memberDrafts[groupId] || { name: '', phone: '' };
    const name = draft.name.trim();
    const phone = draft.phone.trim();

    if (!name || !phone) {
      setError('Please fill in both member name and phone number.');
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      await axios.post(`${API_URL}/${groupId}/members`, {
        name,
        phone,
        requesterPhone: currentUser?.phone || '',
        requesterEmail: currentUser?.email || '',
      });
      setSuccessMessage('Member added successfully.');
      setMemberDrafts((prev) => ({
        ...prev,
        [groupId]: { name: '', phone: '' },
      }));
      setAddingMemberId(null);
      await fetchGroups();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleJoinGroup = async (groupId) => {
    if (!currentUser?.name || !currentUser?.phone) {
      setError('Your account is missing name or phone. Please sign up again.');
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setJoiningGroupId(groupId);
    try {
      await axios.post(`${API_URL}/${groupId}/members`, {
        name: currentUser.name,
        phone: currentUser.phone,
      });
      setSuccessMessage('You joined the group.');
      await fetchGroups();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setJoiningGroupId(null);
    }
  };

  const handleRemoveMember = async (groupId, phone) => {
    setError(null);
    setSuccessMessage(null);
    try {
      await axios.delete(`${API_URL}/${groupId}/members/${phone}?requesterEmail=${encodeURIComponent(currentUser?.email || '')}`);
      setSuccessMessage('Member removed.');
      await fetchGroups();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleBulkAddMembers = async (groupId, bulkText) => {
    setError(null);
    setSuccessMessage(null);
    
    // Parse bulkText (e.g. "Name, Phone\nName2, Phone2")
    const lines = bulkText.split('\n');
    const members = [];
    for (const line of lines) {
       const parts = line.split(',');
       if (parts.length >= 2) {
           const name = parts[0].trim();
           const phone = parts[1].trim();
           if (name && phone) members.push({ name, phone });
       }
    }
    
    if (members.length === 0) {
       setError('Please enter at least one valid member format (Name, Phone).');
       return;
    }

    try {
      await axios.post(`${API_URL}/${groupId}/members/bulk`, {
        members,
        requesterEmail: currentUser?.email || '',
      });
      setSuccessMessage('Bulk add successful.');
      await fetchGroups();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleBulkRemoveMembers = async (groupId, phones) => {
    if (!phones || phones.length === 0) return;
    setError(null);
    setSuccessMessage(null);
    try {
      await axios.delete(`${API_URL}/${groupId}/members`, {
         data: { phones, requesterEmail: currentUser?.email || '' }
      });
      setSuccessMessage(`Removed selected members.`);
      await fetchGroups();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleUpdateProfile = async (name, phone) => {
    setError(null);
    setSuccessMessage(null);
    try {
      const { data } = await axios.put(`${AUTH_API_URL}/update`, {
         email: currentUser?.email,
         name,
         phone
      });
      setCurrentUser(data.user);
      setSuccessMessage('Profile updated successfully.');
      await fetchGroups(); // Refresh groups because members array cascades
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const sharedPageProps = {
    theme,
    onToggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
    onSignOut: handleSignOut,
    currentUser,
    onUpdateProfile: handleUpdateProfile,
    groups,
    loading,
    joiningGroupId,
    addingMemberId,
    memberDrafts,
    onJoin: handleJoinGroup,
    onToggleAddMember: toggleAddMemberForm,
    onMemberDraftChange: handleExistingMemberDraftChange,
    onAddMember: handleAddMemberToGroup,
    onRemoveMember: handleRemoveMember,
    onBulkAddMembers: handleBulkAddMembers,
    onBulkRemoveMembers: handleBulkRemoveMembers,
  };

  if (!authUser) {
    return (
      <div className="mobicircle-app">
        <div className="auth-shell">
          <section className="auth-panel">
            <div className="auth-brand">
              <div className="mc-logo" aria-hidden>
                M
              </div>
              <div className="mc-title-block">
                <h1>Seettu LK</h1>
                <p>Sign in to manage your buying circles.</p>
              </div>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={`auth-tab ${authMode === 'signin' ? 'auth-tab--active' : ''}`}
                onClick={() => {
                  setAuthMode('signin');
                  setAuthError(null);
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`auth-tab ${authMode === 'signup' ? 'auth-tab--active' : ''}`}
                onClick={() => {
                  setAuthMode('signup');
                  setAuthError(null);
                }}
              >
                Sign Up
              </button>
            </div>

            {authError && (
              <div className="mc-alert mc-alert--error" role="alert">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="auth-form" noValidate>
              {authMode === 'signup' && (
                <div className="mc-field">
                  <label htmlFor="auth-name">Name</label>
                  <input
                    id="auth-name"
                    name="name"
                    value={authForm.name}
                    onChange={handleAuthChange}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </div>
              )}
              {authMode === 'signup' && (
                <div className="mc-field">
                  <label htmlFor="auth-phone">Phone Number</label>
                  <input
                    id="auth-phone"
                    name="phone"
                    value={authForm.phone}
                    onChange={handleAuthChange}
                    placeholder="e.g. 9876543210"
                    autoComplete="tel"
                  />
                </div>
              )}
              <div className="mc-field">
                <label htmlFor="auth-email">Email</label>
                <input
                  id="auth-email"
                  name="email"
                  type="email"
                  value={authForm.email}
                  onChange={handleAuthChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              <div className="mc-field">
                <label htmlFor="auth-password">Password</label>
                <input
                  id="auth-password"
                  name="password"
                  type="password"
                  value={authForm.password}
                  onChange={handleAuthChange}
                  placeholder="Enter password"
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                />
              </div>
              <button type="submit" className="mc-btn mc-btn--primary auth-submit" disabled={authSubmitting}>
                {authSubmitting ? 'Please wait…' : authMode === 'signup' ? 'Create account' : 'Sign in'}
              </button>
            </form>
          </section>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          <HomePage
            {...sharedPageProps}
            error={error}
            successMessage={successMessage}
            onDelete={handleDelete}
          />
        }
      />
      <Route
        path="/create-group/:adId"
        element={<CreateGroupPage {...sharedPageProps} fetchGroups={fetchGroups} />}
      />
    </Routes>
  );
}

export default App;
