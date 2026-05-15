import { useNavigate } from 'react-router-dom';
import AppHeader from '../components/AppHeader';
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
}) {
  const navigate = useNavigate();

  return (
    <div className="mobicircle-app">
      <div className="mobicircle-inner">
        <AppHeader theme={theme} onToggleTheme={onToggleTheme} onSignOut={onSignOut} />

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
              {groups.length === 0 ? (
                <p className="mc-empty">
                  No groups yet. Pick a product above and start a buying circle.
                </p>
              ) : (
                groups.map((group) => (
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
