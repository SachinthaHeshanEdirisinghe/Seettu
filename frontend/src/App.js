import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import './MobiCircle.css';

/** Base URL for the Express API (matches server default port 5000). */
const API_URL = 'http://localhost:5000/api/groups';

const CATEGORIES = ['Car', 'Phone', 'Bike'];

function App() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

    const payload = {
      groupName: form.groupName.trim(),
      category: form.category,
      productName: form.productName.trim(),
      totalPrice,
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

  const formatMoney = (n) =>
    typeof n === 'number' && !Number.isNaN(n)
      ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)
      : '—';

  const monthlyInstallment = (total) =>
    typeof total === 'number' && !Number.isNaN(total) ? total / 10 : null;

  return (
    <div className="mobicircle-app">
      <div className="mobicircle-inner">
        <header className="mc-header">
          <div className="mc-brand">
            <div className="mc-logo" aria-hidden>
              M
            </div>
            <div className="mc-title-block">
              <h1>MobiCircle</h1>
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

        <section className="mc-panel" aria-labelledby="new-group-heading">
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
                      </div>
                      <div className="mc-card-actions">
                        <button
                          type="button"
                          className="mc-btn mc-btn--danger"
                          style={{ width: '100%' }}
                          onClick={() => handleDelete(g._id)}
                        >
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
