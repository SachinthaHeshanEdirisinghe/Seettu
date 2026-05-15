import { Trash2, UserPlus } from 'lucide-react';
import { formatMoney, monthlyInstallment } from '../utils';

function GroupCard({
  group,
  currentUser,
  joiningGroupId,
  addingMemberId,
  memberDrafts,
  onJoin,
  onDelete,
  onToggleAddMember,
  onMemberDraftChange,
  onAddMember,
  showDelete = true,
}) {
  const monthly = monthlyInstallment(group.totalPrice);
  const isJoined =
    Array.isArray(group.members) &&
    currentUser?.phone &&
    group.members.some((member) => member.phone === currentUser.phone);

  return (
    <article className="mc-card">
      <div className="mc-card-header">
        <h3 className="mc-card-title">{group.groupName}</h3>
        <span className="mc-badge">{group.category}</span>
      </div>
      <div className="mc-card-body">
        <p className="mc-meta">
          <strong>Product:</strong> {group.productName}
        </p>
        <div className="mc-price-row">
          <div>
            <div className="mc-price-label">Total</div>
            <div className="mc-price-value">{formatMoney(group.totalPrice)}</div>
          </div>
          <div className="mc-installment">
            / mo (÷10)
            <br />
            <span>{monthly != null ? formatMoney(monthly) : '—'}</span>
          </div>
        </div>
        <p className="mc-meta">
          <strong>Members:</strong> {Array.isArray(group.members) ? group.members.length : 0}
        </p>
      </div>
      <div className="mc-card-actions">
        <button
          type="button"
          className={`mc-btn ${isJoined ? 'mc-btn--secondary' : 'mc-btn--success'}`}
          style={{ width: '100%', marginBottom: '0.6rem' }}
          onClick={() => onJoin(group._id)}
          disabled={isJoined || joiningGroupId === group._id}
        >
          {isJoined ? 'Joined' : joiningGroupId === group._id ? 'Joining…' : 'Join Group'}
        </button>
        {isJoined && (
          <button
            type="button"
            className="mc-btn mc-btn--success"
            style={{ width: '100%', marginBottom: '0.6rem' }}
            onClick={() => onToggleAddMember(group._id)}
          >
            <UserPlus size={16} aria-hidden />
            {addingMemberId === group._id ? 'Close' : 'Add Member'}
          </button>
        )}
        {isJoined && addingMemberId === group._id && (
          <div className="mc-card-member-form">
            <div className="mc-field">
              <label htmlFor={`card-member-name-${group._id}`}>Member Name</label>
              <input
                id={`card-member-name-${group._id}`}
                value={(memberDrafts[group._id] && memberDrafts[group._id].name) || ''}
                onChange={(e) => onMemberDraftChange(group._id, 'name', e.target.value)}
                placeholder="e.g. Alex"
                autoComplete="off"
              />
            </div>
            <div className="mc-field">
              <label htmlFor={`card-member-phone-${group._id}`}>Phone Number</label>
              <input
                id={`card-member-phone-${group._id}`}
                value={(memberDrafts[group._id] && memberDrafts[group._id].phone) || ''}
                onChange={(e) => onMemberDraftChange(group._id, 'phone', e.target.value)}
                placeholder="e.g. 9876543210"
                autoComplete="off"
              />
            </div>
            <button
              type="button"
              className="mc-btn mc-btn--success"
              style={{ width: '100%' }}
              onClick={() => onAddMember(group._id)}
            >
              Save Member
            </button>
          </div>
        )}
        {showDelete && (
          <button
            type="button"
            className="mc-btn mc-btn--danger"
            style={{ width: '100%' }}
            onClick={() => onDelete(group._id)}
          >
            <Trash2 size={16} aria-hidden />
            Delete
          </button>
        )}
      </div>
    </article>
  );
}

export default GroupCard;
