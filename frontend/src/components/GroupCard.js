import { useState } from 'react';
import { Trash2, UserPlus, CheckSquare } from 'lucide-react';
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
  onRemoveMember,
  onBulkAddMembers,
  onBulkRemoveMembers,
  showDelete = true,
}) {
  const [selectedPhones, setSelectedPhones] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');
  
  const monthly = monthlyInstallment(group.totalPrice);
  const isJoined =
    Array.isArray(group.members) &&
    currentUser?.phone &&
    group.members.some((member) => member.phone === currentUser.phone);
    
  const isAdmin = group.admin === currentUser?.email;

  const toggleSelection = (phone) => {
      setSelectedPhones(prev => 
          prev.includes(phone) ? prev.filter(p => p !== phone) : [...prev, phone]
      );
  };

  const handleBulkRemove = () => {
       if (selectedPhones.length > 0) {
           onBulkRemoveMembers(group._id, selectedPhones);
           setSelectedPhones([]);
       }
  };

  const handleBulkAdd = () => {
      if (bulkText.trim()) {
          onBulkAddMembers(group._id, bulkText);
          setBulkText('');
      }
  };

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p className="mc-meta">
            <strong>Members:</strong> {Array.isArray(group.members) ? group.members.length : 0}
          </p>
          {isAdmin && selectedPhones.length > 0 && (
             <button type="button" className="mc-btn mc-btn--danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={handleBulkRemove}>
                 Remove {selectedPhones.length}
             </button>
          )}
        </div>
        
        {Array.isArray(group.members) && group.members.length > 0 && (
          <ul style={{ listStyleType: 'none', padding: 0, marginTop: '8px', fontSize: '0.9rem' }}>
            {group.members.map(member => (
              <li key={member.phone} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', background: 'var(--surface-elevated)', padding: '4px 8px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isAdmin && (
                        <input 
                            type="checkbox" 
                            checked={selectedPhones.includes(member.phone)}
                            onChange={() => toggleSelection(member.phone)}
                            style={{ cursor: 'pointer' }}
                        />
                    )}
                    <span>{member.name} ({member.phone})</span>
                </div>
                {isAdmin && (
                  <button 
                    type="button" 
                    className="mc-btn mc-btn--danger" 
                    style={{ padding: '2px 6px', fontSize: '0.75rem', minWidth: 'auto', minHeight: 'auto', borderRadius: '4px', display: 'inline-flex' }}
                    onClick={() => onRemoveMember(group._id, member.phone)}
                  >
                    X
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mc-card-actions">
        {!isJoined ? (
            <button
              type="button"
              className="mc-btn mc-btn--success"
              style={{ width: '100%', marginBottom: '0.6rem' }}
              onClick={() => onJoin(group._id)}
              disabled={joiningGroupId === group._id}
            >
              {joiningGroupId === group._id ? 'Joining…' : 'Join Group'}
            </button>
        ) : (
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <button type="button" className="mc-btn mc-btn--secondary" style={{ flex: 1 }} disabled>
                  Joined
                </button>
                {!isAdmin && currentUser?.phone && (
                    <button
                      type="button"
                      className="mc-btn mc-btn--danger"
                      style={{ flex: 1 }}
                      onClick={() => onRemoveMember(group._id, currentUser.phone)}
                    >
                      Leave Group
                    </button>
                )}
            </div>
        )}
        {(isJoined || isAdmin) && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
               <button
                 type="button"
                 className="mc-btn mc-btn--success"
                 style={{ flex: 1 }}
                 onClick={() => { setBulkMode(false); onToggleAddMember(group._id); }}
               >
                 <UserPlus size={16} aria-hidden />
                 {addingMemberId === group._id && !bulkMode ? 'Close' : 'Add 1'}
               </button>
               {isAdmin && (
                   <button
                     type="button"
                     className="mc-btn mc-btn--secondary"
                     style={{ flex: 1 }}
                     onClick={() => { 
                         if (addingMemberId !== group._id) onToggleAddMember(group._id);
                         setBulkMode(!bulkMode); 
                     }}
                   >
                     Batch
                   </button>
               )}
          </div>
        )}
        
        {(isJoined || isAdmin) && addingMemberId === group._id && !bulkMode && (
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
        
        {isAdmin && addingMemberId === group._id && bulkMode && (
          <div className="mc-card-member-form">
            <div className="mc-field">
              <label htmlFor={`bulk-add-${group._id}`}>Paste Members (Name, Phone)</label>
              <textarea
                id={`bulk-add-${group._id}`}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="Alex, 0710001000&#10;John, 0770002000"
                style={{ width: '100%', minHeight: '80px', padding: '0.5rem', borderRadius: '8px', background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)' }}
              />
            </div>
            <button
              type="button"
              className="mc-btn mc-btn--success"
              style={{ width: '100%' }}
              onClick={handleBulkAdd}
            >
              Bulk Add All
            </button>
          </div>
        )}
        
        {showDelete && isAdmin && (
          <button
            type="button"
            className="mc-btn mc-btn--danger"
            style={{ width: '100%', marginTop: '0.6rem' }}
            onClick={() => onDelete(group._id)}
          >
            <Trash2 size={16} aria-hidden />
            Delete Group
          </button>
        )}
      </div>
    </article>
  );
}

export default GroupCard;
