import { useState } from 'react';
import { ChevronDown, LogOut, Trash2, UserPlus, Users, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useGroups } from '../../context/GroupsContext';
import { formatMoney, monthlyInstallment } from '../../utils';
import AvatarStack from '../ui/AvatarStack';
import CategoryIcon from '../ui/CategoryIcon';
import ConfirmDialog from '../ui/ConfirmDialog';

const EMPTY_DRAFT = { name: '', phone: '' };

function GroupCard({ group, showDelete = true }) {
  const { user } = useAuth();
  const {
    busyGroupId,
    joinGroup,
    leaveGroup,
    deleteGroup,
    addMember,
    removeMember,
    bulkAddMembers,
    bulkRemoveMembers,
  } = useGroups();

  const [showMembers, setShowMembers] = useState(false);
  const [panel, setPanel] = useState(null); // null | 'single' | 'batch'
  const [draft, setDraft] = useState(EMPTY_DRAFT);
  const [bulkText, setBulkText] = useState('');
  const [selected, setSelected] = useState([]);
  const [confirm, setConfirm] = useState(null); // { kind, phone?, name? }

  const members = Array.isArray(group.members) ? group.members : [];
  const busy = busyGroupId === group._id;
  const monthly = monthlyInstallment(group.totalPrice);

  const isAdmin = Boolean(user?.email) && group.admin === user.email;
  const isJoined = Boolean(user?.phone) && members.some((m) => m.phone === user.phone);
  const canAdd = isJoined || isAdmin;

  const togglePanel = (name) => setPanel((current) => (current === name ? null : name));

  const toggleSelected = (phone) =>
    setSelected((prev) => (prev.includes(phone) ? prev.filter((p) => p !== phone) : [...prev, phone]));

  const submitSingle = async () => {
    const name = draft.name.trim();
    const phone = draft.phone.trim();
    if (!name || !phone) return;
    const { ok } = await addMember(group._id, { name, phone });
    if (ok) {
      setDraft(EMPTY_DRAFT);
      setPanel(null);
    }
  };

  const submitBulk = async () => {
    if (!bulkText.trim()) return;
    const { ok } = await bulkAddMembers(group._id, bulkText);
    if (ok) {
      setBulkText('');
      setPanel(null);
    }
  };

  const runConfirmed = async () => {
    if (!confirm) return;
    const { kind, phone } = confirm;
    setConfirm(null);
    if (kind === 'delete') await deleteGroup(group._id);
    if (kind === 'leave') await leaveGroup(group._id);
    if (kind === 'remove') await removeMember(group._id, phone);
    if (kind === 'bulkRemove') {
      await bulkRemoveMembers(group._id, selected);
      setSelected([]);
    }
  };

  const confirmCopy = {
    delete: {
      title: 'Delete this group?',
      message: `“${group.groupName}” and its member list will be removed for everyone.`,
      label: 'Delete group',
    },
    leave: {
      title: 'Leave this group?',
      message: `You will no longer be part of “${group.groupName}”.`,
      label: 'Leave group',
    },
    remove: {
      title: 'Remove member?',
      message: `${confirm?.name || 'This member'} will be removed from “${group.groupName}”.`,
      label: 'Remove',
    },
    bulkRemove: {
      title: `Remove ${selected.length} members?`,
      message: `They will be removed from “${group.groupName}”.`,
      label: `Remove ${selected.length}`,
    },
  }[confirm?.kind || 'delete'];

  return (
    <article className="group-card">
      <header className="group-card__head">
        <span className="group-card__icon">
          <CategoryIcon category={group.category} />
        </span>
        <div className="group-card__titles">
          <h3 className="group-card__title">{group.groupName}</h3>
          <p className="group-card__product">{group.productName}</p>
        </div>
        <span className="badge">{group.category}</span>
      </header>

      <dl className="group-card__price">
        <div>
          <dt>Total</dt>
          <dd className="group-card__total">{formatMoney(group.totalPrice)}</dd>
        </div>
        <div>
          <dt>Per month (÷10)</dt>
          <dd>{monthly != null ? formatMoney(monthly) : '—'}</dd>
        </div>
      </dl>

      <button
        type="button"
        className="group-card__members-toggle"
        onClick={() => setShowMembers((v) => !v)}
        aria-expanded={showMembers}
      >
        <AvatarStack members={members} />
        <span className="group-card__count">
          <Users size={15} aria-hidden /> {members.length} {members.length === 1 ? 'member' : 'members'}
        </span>
        <ChevronDown
          size={18}
          aria-hidden
          className={`group-card__chevron ${showMembers ? 'is-open' : ''}`}
        />
      </button>

      {showMembers && members.length > 0 && (
        <div className="member-list">
          {isAdmin && selected.length > 0 && (
            <button
              type="button"
              className="btn btn--danger btn--sm"
              onClick={() => setConfirm({ kind: 'bulkRemove' })}
              disabled={busy}
            >
              <Trash2 size={14} aria-hidden /> Remove {selected.length} selected
            </button>
          )}
          <ul>
            {members.map((m) => (
              <li key={m.phone} className="member-item">
                {isAdmin && (
                  <input
                    type="checkbox"
                    checked={selected.includes(m.phone)}
                    onChange={() => toggleSelected(m.phone)}
                    aria-label={`Select ${m.name}`}
                  />
                )}
                <span className="member-item__name">{m.name}</span>
                <span className="member-item__phone">{m.phone}</span>
                {isAdmin && (
                  <button
                    type="button"
                    className="icon-btn icon-btn--danger"
                    onClick={() => setConfirm({ kind: 'remove', phone: m.phone, name: m.name })}
                    aria-label={`Remove ${m.name}`}
                    disabled={busy}
                  >
                    <X size={15} aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="group-card__actions">
        {!isJoined ? (
          <button
            type="button"
            className="btn btn--primary btn--block"
            onClick={() => joinGroup(group._id)}
            disabled={busy}
          >
            {busy ? 'Joining…' : 'Join group'}
          </button>
        ) : (
          <div className="group-card__joined">
            <span className="status-pill">You’re in</span>
            {!isAdmin && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setConfirm({ kind: 'leave' })}
                disabled={busy}
              >
                <LogOut size={15} aria-hidden /> Leave
              </button>
            )}
          </div>
        )}

        {canAdd && (
          <div className="group-card__add">
            <button
              type="button"
              className={`btn btn--secondary btn--sm ${panel === 'single' ? 'is-active' : ''}`}
              onClick={() => togglePanel('single')}
              aria-expanded={panel === 'single'}
            >
              <UserPlus size={15} aria-hidden /> Add member
            </button>
            {isAdmin && (
              <button
                type="button"
                className={`btn btn--secondary btn--sm ${panel === 'batch' ? 'is-active' : ''}`}
                onClick={() => togglePanel('batch')}
                aria-expanded={panel === 'batch'}
              >
                Add many
              </button>
            )}
          </div>
        )}

        {canAdd && panel === 'single' && (
          <div className="inline-form">
            <div className="field">
              <label htmlFor={`card-member-name-${group._id}`}>Member name</label>
              <div className="field__control">
                <input
                  id={`card-member-name-${group._id}`}
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="e.g. Alex"
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="field">
              <label htmlFor={`card-member-phone-${group._id}`}>Phone number</label>
              <div className="field__control">
                <input
                  id={`card-member-phone-${group._id}`}
                  value={draft.phone}
                  onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                  placeholder="e.g. 0771234567"
                  autoComplete="off"
                />
              </div>
            </div>
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={submitSingle}
              disabled={busy || !draft.name.trim() || !draft.phone.trim()}
            >
              Save member
            </button>
          </div>
        )}

        {isAdmin && panel === 'batch' && (
          <div className="inline-form">
            <div className="field">
              <label htmlFor={`bulk-add-${group._id}`}>One member per line: name, phone</label>
              <div className="field__control">
                <textarea
                  id={`bulk-add-${group._id}`}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={'Alex, 0710001000\nJohn, 0770002000'}
                  rows={4}
                />
              </div>
            </div>
            <button
              type="button"
              className="btn btn--primary btn--block"
              onClick={submitBulk}
              disabled={busy || !bulkText.trim()}
            >
              Add all
            </button>
          </div>
        )}

        {showDelete && isAdmin && (
          <button
            type="button"
            className="btn btn--danger btn--block"
            onClick={() => setConfirm({ kind: 'delete' })}
            disabled={busy}
          >
            <Trash2 size={16} aria-hidden /> Delete group
          </button>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={confirmCopy.title}
        message={confirmCopy.message}
        confirmLabel={confirmCopy.label}
        danger
        busy={busy}
        onConfirm={runConfirmed}
        onCancel={() => setConfirm(null)}
      />
    </article>
  );
}

export default GroupCard;
