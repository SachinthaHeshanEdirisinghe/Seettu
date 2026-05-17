import React, { useState } from 'react';

function Navbar({ theme, onToggleTheme, currentUser, onUpdateProfile, onSignOut }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });

  const handleEditClick = () => {
    setEditForm({ name: currentUser?.name || '', phone: currentUser?.phone || '' });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (editForm.name && editForm.phone) {
      onUpdateProfile(editForm.name, editForm.phone);
      setIsEditing(false);
    }
  };
  return (
    <nav className="mc-navbar">
      <div className="mc-brand">
        {/* Placeholder for the user's logo. They should place logo.png in the public folder. */}
        <img src="/logo.png" alt="Seettu LK Logo" className="mc-logo-image" style={{ width: '120px', height: 'auto', objectFit: 'contain' }} />
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          type="button"
          className="mc-theme-toggle"
          onClick={onToggleTheme}
          aria-pressed={theme === 'dark'}
        >
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>

        <button type="button" className="mc-btn mc-btn--secondary" onClick={handleEditClick} style={{ padding: '0.4rem 1rem' }}>
          Edit Profile
        </button>

      </div>

      {isEditing && (
        <div style={{ position: 'absolute', top: '70px', right: '1.5rem', background: 'var(--surface-elevated)', padding: '1.25rem', border: '1px solid var(--border)', borderRadius: '12px', boxShadow: 'var(--shadow)', zIndex: 100, width: '300px' }}>
          <h4 style={{ margin: '0 0 0.5rem 0' }}>Edit Profile</h4>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Logged in as: <strong>{currentUser?.name}</strong> <br />
            Phone: <strong>{currentUser?.phone}</strong>
          </p>
          <div className="mc-field" style={{ marginBottom: '0.8rem' }}>
            <label>New Name</label>
            <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
          <div className="mc-field" style={{ marginBottom: '1rem' }}>
            <label>New Phone</label>
            <input value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="mc-btn mc-btn--success" style={{ flex: 1 }} onClick={handleSave}>Save</button>
            <button type="button" className="mc-btn mc-btn--secondary" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
          <div style={{ marginTop: '0.8rem' }}>
             <button type="button" className="mc-btn mc-btn--danger" style={{ width: '100%' }} onClick={onSignOut}>Sign Out</button>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
