import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Trash2, UserPlus } from 'lucide-react';
import AppHeader from '../components/AppHeader';
import GroupCard from '../components/GroupCard';
import { API_URL, CATEGORIES, getAdById } from '../constants';
import { getErrorMessage, getSimilarGroups } from '../utils';

function CreateGroupPage({
  theme,
  onToggleTheme,
  onSignOut,
  currentUser,
  groups,
  loading,
  fetchGroups,
  joiningGroupId,
  addingMemberId,
  memberDrafts,
  onJoin,
  onToggleAddMember,
  onMemberDraftChange,
  onAddMember,
}) {
  const { adId } = useParams();
  const navigate = useNavigate();
  const ad = getAdById(adId);

  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    groupName: '',
    category: 'Car',
    productName: '',
    totalPrice: '',
    members: [{ name: '', phone: '' }],
  });

  const similarGroups = useMemo(() => getSimilarGroups(groups, ad), [groups, ad]);

  useEffect(() => {
    if (!ad) {
      navigate('/', { replace: true });
      return;
    }
    setForm({
      groupName: ad.title,
      category: CATEGORIES.includes(ad.category) ? ad.category : 'Phone',
      productName: ad.title,
      totalPrice: String(ad.totalPrice ?? ''),
      members: currentUser?.name && currentUser?.phone
        ? [{ name: currentUser.name, phone: currentUser.phone }]
        : [{ name: '', phone: '' }],
    });
  }, [ad, currentUser, navigate]);

  if (!ad) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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
    if (!currentUser?.email) {
      setError('You must be signed in to create a group.');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(API_URL, {
        groupName: form.groupName.trim(),
        category: form.category,
        productName: form.productName.trim(),
        totalPrice,
        members,
        creatorEmail: currentUser.email,
      });
      await fetchGroups();
      navigate('/', {
        state: { successMessage: `Group created for "${ad.title}".` },
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mobicircle-app">
      <div className="mobicircle-inner">
        <AppHeader theme={theme} onToggleTheme={onToggleTheme} onSignOut={onSignOut}>
          <Link to="/" className="mc-btn mc-btn--secondary mc-back-link">
            ← Back to home
          </Link>
        </AppHeader>

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

        <section className="mc-product-banner" aria-labelledby="product-banner-heading">
          <span className="mc-ad-tag">{ad.tag}</span>
          <h2 id="product-banner-heading">{ad.title}</h2>
          <p>{ad.blurb}</p>
          <strong>{ad.price}</strong>
        </section>

        <div className="mc-create-layout">
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
                  <select id="category" name="category" value={form.category} onChange={handleChange}>
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
                  <button type="button" className="mc-btn mc-btn--secondary" onClick={handleAddMember}>
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

          <section aria-labelledby="similar-groups-heading">
            <h2 id="similar-groups-heading" className="mc-section-title">
              Similar groups ({ad.category})
            </h2>
            {loading ? (
              <p className="mc-loading">Loading similar groups…</p>
            ) : similarGroups.length === 0 ? (
              <p className="mc-empty">No similar groups yet. Be the first to start one for this product.</p>
            ) : (
              <div className="mc-grid mc-grid--compact">
                {similarGroups.map((group) => (
                  <GroupCard
                    key={group._id}
                    group={group}
                    currentUser={currentUser}
                    joiningGroupId={joiningGroupId}
                    addingMemberId={addingMemberId}
                    memberDrafts={memberDrafts}
                    onJoin={onJoin}
                    onToggleAddMember={onToggleAddMember}
                    onMemberDraftChange={onMemberDraftChange}
                    onAddMember={onAddMember}
                    showDelete={false}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupPage;
