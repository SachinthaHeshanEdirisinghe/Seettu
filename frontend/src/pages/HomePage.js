import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGroups } from '../context/GroupsContext';
import { ELECTRONIC_ADS } from '../constants';
import { getFirstName } from '../utils';
import AdCard from '../components/groups/AdCard';
import GroupCard from '../components/groups/GroupCard';

const ALL = 'All';
const AD_CATEGORIES = [ALL, ...new Set(ELECTRONIC_ADS.map((ad) => ad.category))];

function HomePage() {
  const { user } = useAuth();
  const { groups, loading } = useGroups();
  const [category, setCategory] = useState(ALL);

  const myGroups = useMemo(
    () =>
      groups.filter(
        (g) =>
          g.admin === user?.email ||
          (Array.isArray(g.members) &&
            user?.phone &&
            g.members.some((m) => m.phone === user.phone))
      ),
    [groups, user]
  );
  const managedCount = myGroups.filter((g) => g.admin === user?.email).length;

  const ads = category === ALL ? ELECTRONIC_ADS : ELECTRONIC_ADS.filter((a) => a.category === category);

  return (
    <>
      <section className="hero" aria-labelledby="hello-heading">
        <h1 id="hello-heading" className="hero__title">
          Hi {getFirstName(user?.name)}, ready to pool an order?
        </h1>
        <p className="hero__text">
          {loading
            ? 'Loading your circles…'
            : myGroups.length === 0
            ? 'You are not in any circle yet. Pick a product below to start one.'
            : `You are in ${myGroups.length} ${myGroups.length === 1 ? 'circle' : 'circles'}` +
              (managedCount > 0 ? `, and you manage ${managedCount}.` : '.')}
        </p>
      </section>

      <section className="section" aria-labelledby="groups-heading">
        <div className="section__head">
          <h2 id="groups-heading" className="section__title">
            Your circles
          </h2>
        </div>
        {loading ? (
          <div className="grid" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton" />
            ))}
          </div>
        ) : myGroups.length === 0 ? (
          <div className="empty">
            <h3>No circles yet</h3>
            <p>Choose a product below and start a buying circle. Your circles will show up here.</p>
          </div>
        ) : (
          <div className="grid">
            {myGroups.map((group) => (
              <GroupCard key={group._id} group={group} />
            ))}
          </div>
        )}
      </section>

      <section className="section" id="products" aria-labelledby="ads-heading">
        <div className="section__head">
          <h2 id="ads-heading" className="section__title">
            Products to pool for
          </h2>
          <div className="chips" role="group" aria-label="Filter products by category">
            {AD_CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                className={`chip ${category === c ? 'is-active' : ''}`}
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid--ads">
          {ads.map((ad) => (
            <AdCard key={ad.id} ad={ad} />
          ))}
        </div>
      </section>
    </>
  );
}

export default HomePage;
