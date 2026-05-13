import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Trash2, UserPlus } from 'lucide-react';
import './MobiCircle.css';

/** Base URL for the Express API (matches server default port 5000). */
const API_URL = 'http://localhost:5000/api/groups';
const AUTH_USERS_KEY = 'mobicircle_users';
const AUTH_SESSION_KEY = 'mobicircle_session_user';

const CATEGORIES = [
  'Car',
  'Phone',
  'Bike',
  'TV',
  'Laptop',
  'Audio',
  'Tablet',
  'Camera',
  'Smartwatch',
  'Appliance',
  'Gaming',
];
const ELECTRONIC_ADS = [
  {
    id: 'ad-1',
    title: 'Samsung 55" 4K Smart TV',
    tag: 'Home Entertainment',
    category: 'TV',
    totalPrice: 499,
    price: '$499',
    blurb: 'Crystal UHD display with voice assistant and 1-year warranty.',
  },
  {
    id: 'ad-2',
    title: 'Apple iPhone 15',
    tag: 'Smartphone',
    category: 'Phone',
    totalPrice: 799,
    price: '$799',
    blurb: 'A16 Bionic performance, great cameras, and all-day battery life.',
  },
  {
    id: 'ad-3',
    title: 'Sony WH-1000XM5',
    tag: 'Audio',
    category: 'Audio',
    totalPrice: 329,
    price: '$329',
    blurb: 'Industry-leading noise cancellation for work, travel, and music.',
  },
  {
    id: 'ad-4',
    title: 'Dell XPS 13',
    tag: 'Ultrabook',
    category: 'Laptop',
    totalPrice: 999,
    price: '$999',
    blurb: 'Compact premium laptop with long battery life and fast SSD.',
  },
  {
    id: 'ad-5',
    title: 'iPad Air (M2)',
    tag: 'Tablet',
    category: 'Tablet',
    totalPrice: 599,
    price: '$599',
    blurb: 'Powerful tablet for study, design, and streaming on the go.',
  },
  {
    id: 'ad-6',
    title: 'Canon EOS R50',
    tag: 'Camera',
    category: 'Camera',
    totalPrice: 679,
    price: '$679',
    blurb: 'Mirrorless camera with 4K video and sharp autofocus.',
  },
  {
    id: 'ad-7',
    title: 'Apple Watch Series 9',
    tag: 'Wearables',
    category: 'Smartwatch',
    totalPrice: 399,
    price: '$399',
    blurb: 'Health tracking, notifications, and all-day performance.',
  },
  {
    id: 'ad-8',
    title: 'PlayStation 5 Slim',
    tag: 'Gaming',
    category: 'Gaming',
    totalPrice: 499,
    price: '$499',
    blurb: 'Next-gen console gaming with lightning-fast load times.',
  },
  {
    id: 'ad-9',
    title: 'LG 260L Smart Inverter Fridge',
    tag: 'Home Appliance',
    category: 'Appliance',
    totalPrice: 449,
    price: '$449',
    blurb: 'Energy-efficient refrigerator with smart cooling technology.',
  },
];

function App() {
  const createGroupRef = useRef(null);
  const [authMode, setAuthMode] = useState('signin');
  const [authUser, setAuthUser] = useState(() => localStorage.getItem(AUTH_SESSION_KEY) || '');
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
  const [submitting, setSubmitting] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [addingMemberId, setAddingMemberId] = useState(null);
  const [memberDrafts, setMemberDrafts] = useState({});
  const [theme, setTheme] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  );

  /** User-visible API/network errors */
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [form, setForm] = useState({
    groupName: '',
    category: 'Car',
    productName: '',
    totalPrice: '',
    members: [{ name: '', phone: '' }],
  });

  /** Normalize axios failures into a short message (offline, timeout, 5xx). */
  const getErrorMessage = (err) => {
    if (axios.isAxiosError(err)) {
      if (!err.response) {
        return 'Cannot reach the server. Is the backend running at http://localhost:5000?';
      }
      const data = err.response.data;
      if (typeof data === 'object' && data !== null && data.message) {
        return String(data.message);
      }
      return err.response.statusText || `Request failed (${err.response.status})`;
    }
    return err?.message || 'Something went wrong.';
  };

  const getStoredUsers = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(AUTH_USERS_KEY) || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const currentUser = getStoredUsers().find((user) => user.email === authUser) || null;

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
      fetchGroups();
    } else {
      setGroups([]);
      setLoading(false);
    }
  }, [authUser, fetchGroups]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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
      const users = getStoredUsers();
      if (authMode === 'signup') {
        const alreadyExists = users.some((u) => u.email === email);
        if (alreadyExists) {
          setAuthError('This email is already registered. Please sign in.');
          return;
        }
        const updatedUsers = [...users, { name, phone, email, password }];
        localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(updatedUsers));
        localStorage.setItem(AUTH_SESSION_KEY, email);
        setAuthUser(email);
        setSuccessMessage('Account created successfully.');
      } else {
        const foundUser = users.find((u) => u.email === email && u.password === password);
        if (!foundUser) {
          setAuthError('Invalid email or password.');
          return;
        }
        localStorage.setItem(AUTH_SESSION_KEY, email);
        setAuthUser(email);
        setSuccessMessage('Signed in successfully.');
      }

      setAuthForm({ name: '', phone: '', email: '', password: '' });
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem(AUTH_SESSION_KEY);
    setAuthUser('');
    setAuthMode('signin');
    setAuthForm({ name: '', phone: '', email: '', password: '' });
    setGroups([]);
    setAddingMemberId(null);
    setMemberDrafts({});
    setError(null);
    setSuccessMessage(null);
  };

  const handleMemberChange = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      members: prev.members.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member
      ),
    }));
  };

  const handleAddMember = () => {
    setForm((prev) => ({
      ...prev,
      members: [...prev.members, { name: '', phone: '' }],
    }));
  };

  const handleRemoveMember = (index) => {
    setForm((prev) => {
      const updatedMembers = prev.members.filter((_, memberIndex) => memberIndex !== index);
      return {
        ...prev,
        members: updatedMembers.length > 0 ? updatedMembers : [{ name: '', phone: '' }],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const totalPrice = Number.parseFloat(form.totalPrice);
    if (!form.groupName.trim() || !form.productName.trim()) {
      setError('Please fill in group name and product name.');
      return;
    }
    if (Number.isNaN(totalPrice) || totalPrice <= 0) {
      setError('Total price must be a positive number.');
      return;
    }
    const members = form.members
      .map((member) => ({
        name: member.name.trim(),
        phone: member.phone.trim(),
      }))
      .filter((member) => member.name || member.phone);
    const hasIncompleteMember = members.some((member) => !member.name || !member.phone);
    if (members.length === 0) {
      setError('Please add at least one group member.');
      return;
    }
    if (hasIncompleteMember) {
      setError('Each member row must include both name and phone number.');
      return;
    }

    const payload = {
      groupName: form.groupName.trim(),
      category: form.category,
      productName: form.productName.trim(),
      totalPrice,
      members,
    };

    setSubmitting(true);
    try {
      await axios.post(API_URL, payload);
      setSuccessMessage('Group created successfully.');
      setForm({
        groupName: '',
        category: 'Car',
        productName: '',
        totalPrice: '',
        members: [{ name: '', phone: '' }],
      });
      await fetchGroups();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setError(null);
    setSuccessMessage(null);
    try {
      await axios.delete(`${API_URL}/${id}`);
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

  const handleCreateFromAd = (ad) => {
    setError(null);
    setSuccessMessage(`Creating group for "${ad.title}". Fill remaining details and submit.`);
    setForm((prev) => ({
      ...prev,
      groupName: ad.title,
      productName: ad.title,
      category: CATEGORIES.includes(ad.category) ? ad.category : 'Phone',
      totalPrice: String(ad.totalPrice ?? ''),
    }));
    createGroupRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const formatMoney = (n) =>
    typeof n === 'number' && !Number.isNaN(n)
      ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)
      : '—';

  const monthlyInstallment = (total) =>
    typeof total === 'number' && !Number.isNaN(total) ? total / 10 : null;

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
    <div className="mobicircle-app">
      <div className="mobicircle-inner">
        <header className="mc-header">
          <div className="mc-brand">
            <div className="mc-logo" aria-hidden>
              M
            </div>
            <div className="mc-title-block">
              <h1>Seettu LK</h1>
              <p>Group buying — pool orders, split smarter.</p>
            </div>
          </div>
          <button
            type="button"
            className="mc-theme-toggle"
            onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            aria-pressed={theme === 'dark'}
          >
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button type="button" className="mc-theme-toggle" onClick={handleSignOut}>
            Sign out
          </button>
        </header>

        {error && (
          <div className="mc-alert mc-alert--error" role="alert">
            {error}
          </div>
        )}
        {successMessage && !error && (
          <div className="mc-alert mc-alert--success" role="status">
            {successMessage}
          </div>
        )}

        <section className="mc-ads-panel" aria-labelledby="ads-heading">
          <div className="mc-ads-header">
            <h2 id="ads-heading">Electronic Device Advertisements</h2>
            <span>After-login offers</span>
          </div>
          <div className="mc-ads-grid">
            {ELECTRONIC_ADS.map((ad) => (
              <article key={ad.id} className="mc-ad-card">
                <span className="mc-ad-tag">{ad.tag}</span>
                <h3>{ad.title}</h3>
                <p>{ad.blurb}</p>
                <div className="mc-ad-footer">
                  <strong>{ad.price}</strong>
                  <button
                    type="button"
                    className="mc-btn mc-btn--secondary"
                    onClick={() => handleCreateFromAd(ad)}
                  >
                    Create Group
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mc-panel" aria-labelledby="new-group-heading" ref={createGroupRef}>
          <h2 id="new-group-heading">Start a buying circle</h2>
          <form onSubmit={handleSubmit} noValidate>
            <div className="mc-form-grid">
              <div className="mc-field">
                <label htmlFor="groupName">Group name</label>
                <input
                  id="groupName"
                  name="groupName"
                  value={form.groupName}
                  onChange={handleChange}
                  placeholder="e.g. Downtown EV buyers"
                  autoComplete="off"
                />
              </div>
              <div className="mc-field">
                <label htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mc-field">
                <label htmlFor="productName">Product name</label>
                <input
                  id="productName"
                  name="productName"
                  value={form.productName}
                  onChange={handleChange}
                  placeholder="e.g. Model Y — Long Range"
                  autoComplete="off"
                />
              </div>
              <div className="mc-field">
                <label htmlFor="totalPrice">Total price</label>
                <input
                  id="totalPrice"
                  name="totalPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.totalPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="mc-members-section">
              <div className="mc-members-header">
                <h3>Group Members</h3>
                <button
                  type="button"
                  className="mc-btn mc-btn--secondary"
                  onClick={handleAddMember}
                >
                  <UserPlus size={16} aria-hidden />
                  Add Member
                </button>
              </div>
              <div className="mc-members-list">
                {form.members.map((member, index) => (
                  <div className="mc-member-row" key={`member-${index}`}>
                    <div className="mc-field">
                      <label htmlFor={`member-name-${index}`}>Member Name</label>
                      <input
                        id={`member-name-${index}`}
                        value={member.name}
                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                        placeholder="e.g. Alex"
                        autoComplete="off"
                      />
                    </div>
                    <div className="mc-field">
                      <label htmlFor={`member-phone-${index}`}>Phone Number</label>
                      <input
                        id={`member-phone-${index}`}
                        value={member.phone}
                        onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                        placeholder="e.g. 9876543210"
                        autoComplete="off"
                      />
                    </div>
                    <button
                      type="button"
                      className="mc-remove-member"
                      onClick={() => handleRemoveMember(index)}
                      aria-label={`Remove member ${index + 1}`}
                    >
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="mc-submit-row">
              <button type="submit" className="mc-btn mc-btn--primary" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create group'}
              </button>
              <span className="mc-hint">Monthly installment uses total ÷ 10.</span>
            </div>
          </form>
        </section>

        <section aria-labelledby="groups-heading">
          <h2 id="groups-heading" className="mc-section-title">
            Active circles
          </h2>
          {loading ? (
            <p className="mc-loading">Loading groups…</p>
          ) : (
            <div className="mc-grid">
              {groups.length === 0 ? (
                <p className="mc-empty">
                  No groups yet. Create one above — your cards will appear here.
                </p>
              ) : (
                groups.map((g) => {
                  const monthly = monthlyInstallment(g.totalPrice);
                  const isJoined = Array.isArray(g.members)
                    && currentUser?.phone
                    && g.members.some((member) => member.phone === currentUser.phone);
                  return (
                    <article key={g._id} className="mc-card">
                      <div className="mc-card-header">
                        <h3 className="mc-card-title">{g.groupName}</h3>
                        <span className="mc-badge">{g.category}</span>
                      </div>
                      <div className="mc-card-body">
                        <p className="mc-meta">
                          <strong>Product:</strong> {g.productName}
                        </p>
                        <div className="mc-price-row">
                          <div>
                            <div className="mc-price-label">Total</div>
                            <div className="mc-price-value">{formatMoney(g.totalPrice)}</div>
                          </div>
                          <div className="mc-installment">
                            / mo (÷10)
                            <br />
                            <span>{monthly != null ? formatMoney(monthly) : '—'}</span>
                          </div>
                        </div>
                        <p className="mc-meta">
                          <strong>Members:</strong> {Array.isArray(g.members) ? g.members.length : 0}
                        </p>
                      </div>
                      <div className="mc-card-actions">
                        <button
                          type="button"
                          className={`mc-btn ${isJoined ? 'mc-btn--secondary' : 'mc-btn--success'}`}
                          style={{ width: '100%', marginBottom: '0.6rem' }}
                          onClick={() => handleJoinGroup(g._id)}
                          disabled={isJoined || joiningGroupId === g._id}
                        >
                          {isJoined ? 'Joined' : joiningGroupId === g._id ? 'Joining…' : 'Join Group'}
                        </button>
                        {isJoined && (
                          <button
                            type="button"
                            className="mc-btn mc-btn--success"
                            style={{ width: '100%', marginBottom: '0.6rem' }}
                            onClick={() => toggleAddMemberForm(g._id)}
                          >
                            <UserPlus size={16} aria-hidden />
                            {addingMemberId === g._id ? 'Close' : 'Add Member'}
                          </button>
                        )}
                        {isJoined && addingMemberId === g._id && (
                          <div className="mc-card-member-form">
                            <div className="mc-field">
                              <label htmlFor={`card-member-name-${g._id}`}>Member Name</label>
                              <input
                                id={`card-member-name-${g._id}`}
                                value={(memberDrafts[g._id] && memberDrafts[g._id].name) || ''}
                                onChange={(e) =>
                                  handleExistingMemberDraftChange(g._id, 'name', e.target.value)
                                }
                                placeholder="e.g. Alex"
                                autoComplete="off"
                              />
                            </div>
                            <div className="mc-field">
                              <label htmlFor={`card-member-phone-${g._id}`}>Phone Number</label>
                              <input
                                id={`card-member-phone-${g._id}`}
                                value={(memberDrafts[g._id] && memberDrafts[g._id].phone) || ''}
                                onChange={(e) =>
                                  handleExistingMemberDraftChange(g._id, 'phone', e.target.value)
                                }
                                placeholder="e.g. 9876543210"
                                autoComplete="off"
                              />
                            </div>
                            <button
                              type="button"
                              className="mc-btn mc-btn--success"
                              style={{ width: '100%' }}
                              onClick={() => handleAddMemberToGroup(g._id)}
                            >
                              Save Member
                            </button>
                          </div>
                        )}
                        <button
                          type="button"
                          className="mc-btn mc-btn--danger"
                          style={{ width: '100%' }}
                          onClick={() => handleDelete(g._id)}
                        >
                          <Trash2 size={16} aria-hidden />
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default App;
