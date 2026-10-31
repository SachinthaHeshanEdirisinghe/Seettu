import { useEffect, useRef, useState } from 'react';
import { LogOut, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGroups } from '../../context/GroupsContext';
import { getInitials } from '../../utils';
import Field from '../ui/Field';

function ProfileMenu() {
  const { user, signOut } = useAuth();
  const { updateProfile } = useGroups();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onPointer = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => {
    setOpen((v) => !v);
    setEditing(false);
  };

  const startEdit = () => {
    setForm({ name: user?.name || '', phone: user?.phone || '' });
    setEditing(true);
  };

  const save = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    const phone = form.phone.trim();
    if (!name || !phone) return;
    setSaving(true);
    const { ok } = await updateProfile(name, phone);
    setSaving(false);
    if (ok) {
      setEditing(false);
      setOpen(false);
    }
  };

  return (
    <div className="profile" ref={rootRef}>
      <button
        type="button"
        className="profile__trigger"
        onClick={toggle}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="avatar avatar--lg">{getInitials(user?.name)}</span>
        <span className="profile__name">{user?.name}</span>
      </button>

      {open && (
        <div className="profile__menu" role="menu">
          {!editing ? (
            <>
              <div className="profile__summary">
                <strong>{user?.name}</strong>
                <span>{user?.email}</span>
                <span>{user?.phone}</span>
              </div>
              <button type="button" className="menu-item" role="menuitem" onClick={startEdit}>
                <Pencil size={16} aria-hidden /> Edit profile
              </button>
              <button
                type="button"
                className="menu-item menu-item--danger"
                role="menuitem"
                onClick={signOut}
              >
                <LogOut size={16} aria-hidden /> Sign out
              </button>
            </>
          ) : (
            <form onSubmit={save} className="profile__form">
              <h2 className="profile__form-title">Edit profile</h2>
              <Field
                id="profile-name"
                label="Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                autoComplete="name"
              />
              <Field
                id="profile-phone"
                label="Phone number"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                autoComplete="tel"
              />
              <div className="profile__form-actions">
                <button type="button" className="btn btn--ghost btn--sm" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary btn--sm"
                  disabled={saving || !form.name.trim() || !form.phone.trim()}
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;
