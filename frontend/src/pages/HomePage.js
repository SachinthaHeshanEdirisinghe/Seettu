import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import GroupCard from '../components/GroupCard';
import { ELECTRONIC_ADS } from '../constants';

function HomePage({
  theme,
  onToggleTheme,
  onSignOut,
  error,
  successMessage,
  groups,
  loading,
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
  onUpdateProfile
}) {
  const navigate = useNavigate();

  const userGroups = groups.filter(group => 
    group.admin === currentUser?.email || 
    (Array.isArray(group.members) && currentUser?.phone && group.members.some(member => member.phone === currentUser.phone))
  );

  return (
    <div className="mobicircle-app">
      <Navbar theme={theme} onToggleTheme={onToggleTheme} currentUser={currentUser} onUpdateProfile={onUpdateProfile} onSignOut={onSignOut} />
      <div className="mobicircle-inner">

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
                    onClick={() => navigate(`/create-group/${ad.id}`)}
                  >
                    Create Group
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="groups-heading">
          <h2 id="groups-heading" className="mc-section-title">
            Active circles
          </h2>
          {loading ? (
            <p className="mc-loading">Loading groups…</p>
          ) : (
            <div className="mc-grid">
              {userGroups.length === 0 ? (
                <p className="mc-empty">
                  No groups yet. Pick a product above and start a buying circle.
                </p>
              ) : (
                userGroups.map((group) => (
                  <GroupCard
                    key={group._id}
                    group={group}
                    currentUser={currentUser}
                    joiningGroupId={joiningGroupId}
                    addingMemberId={addingMemberId}
                    memberDrafts={memberDrafts}
                    onJoin={onJoin}
                    onDelete={onDelete}
                    onToggleAddMember={onToggleAddMember}
                    onMemberDraftChange={onMemberDraftChange}
                    onAddMember={onAddMember}
                    onRemoveMember={onRemoveMember}
                    onBulkAddMembers={onBulkAddMembers}
                    onBulkRemoveMembers={onBulkRemoveMembers}
                  />
                ))
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default HomePage;
