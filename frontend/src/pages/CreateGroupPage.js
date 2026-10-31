import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CircleAlert, Trash2, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGroups } from '../context/GroupsContext';
import { useToast } from '../context/ToastContext';
import { CATEGORIES, getAdById } from '../constants';
import { formatMoney, getSimilarGroups, monthlyInstallment } from '../utils';
import GroupCard from '../components/groups/GroupCard';
import CategoryIcon from '../components/ui/CategoryIcon';

const EMPTY_MEMBER = { name: '', phone: '' };

function CreateGroupForm({ ad }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups, loading, createGroup } = useGroups();
  const notify = useToast();

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(() => ({
    groupName: ad.title,
    category: CATEGORIES.includes(ad.category) ? ad.category : 'Phone',
    productName: ad.title,
    totalPrice: String(ad.totalPrice ?? ''),
    members: user?.name && user?.phone ? [{ name: user.name, phone: user.phone }] : [{ ...EMPTY_MEMBER }],
  }));

  const similarGroups = useMemo(() => getSimilarGroups(groups, ad), [groups, ad]);
  const monthly = monthlyInstallment(Number.parseFloat(form.totalPrice));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (index, field, value) =>
    setForm((prev) => ({
      ...prev,
      members: prev.members.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    }));

  const addMemberRow = () =>
    setForm((prev) => ({ ...prev, members: [...prev.members, { ...EMPTY_MEMBER }] }));

  const removeMemberRow = (index) =>
    setForm((prev) => {
      const next = prev.members.filter((_, i) => i !== index);
      return { ...prev, members: next.length > 0 ? next : [{ ...EMPTY_MEMBER }] };
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

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
      .map((m) => ({ name: m.name.trim(), phone: m.phone.trim() }))
      .filter((m) => m.name || m.phone);

    if (members.length === 0) {
      setError('Please add at least one group member.');
      return;
    }
    if (members.some((m) => !m.name || !m.phone)) {
      setError('Each member row must include both name and phone number.');
      return;
    }

    setSubmitting(true);
    const { ok } = await createGroup({
      groupName: form.groupName.trim(),
      category: form.category,
      productName: form.productName.trim(),
      totalPrice,
      members,
    });
    setSubmitting(false);

    if (ok) {
      notify.success(`Group created for “${ad.title}”.`);
      navigate('/');
    }
  };

  return (
    <>
      <Link to="/" className="back-link">
        <ArrowLeft size={16} aria-hidden /> Back to home
      </Link>

      <section className="product-banner" aria-labelledby="product-banner-heading">
        <span className="product-banner__icon">
          <CategoryIcon category={ad.category} size={28} />
        </span>
        <div className="product-banner__body">
          <span className="ad-card__tag">{ad.tag}</span>
          <h1 id="product-banner-heading" className="product-banner__title">
            {ad.title}
          </h1>
          <p>{ad.blurb}</p>
        </div>
        <strong className="product-banner__price">{ad.price}</strong>
      </section>

      <div className="create-layout">
        <section className="panel" aria-labelledby="new-group-heading">
          <h2 id="new-group-heading" className="panel__title">
            Start a buying circle
          </h2>

          {error && (
            <div className="alert alert--error" role="alert">
              <CircleAlert size={18} aria-hidden />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="groupName">Group name</label>
                <div className="field__control">
                  <input
                    id="groupName"
                    name="groupName"
                    value={form.groupName}
                    onChange={handleChange}
                    placeholder="e.g. Kandy TV buyers"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="category">Category</label>
                <div className="field__control">
                  <select id="category" name="category" value={form.category} onChange={handleChange}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="productName">Product name</label>
                <div className="field__control">
                  <input
                    id="productName"
                    name="productName"
                    value={form.productName}
                    onChange={handleChange}
                    placeholder="e.g. Samsung 55&quot; 4K Smart TV"
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="field">
                <label htmlFor="totalPrice">Total price</label>
                <div className="field__control">
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
            </div>

            <div className="members-box">
              <div className="members-box__head">
                <h3>Group members</h3>
                <button type="button" className="btn btn--secondary btn--sm" onClick={addMemberRow}>
                  <UserPlus size={15} aria-hidden /> Add member
                </button>
              </div>
              <div className="members-box__list">
                {form.members.map((member, index) => (
                  <div className="member-row" key={`member-${index}`}>
                    <div className="field">
                      <label htmlFor={`member-name-${index}`}>Member name</label>
                      <div className="field__control">
                        <input
                          id={`member-name-${index}`}
                          value={member.name}
                          onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                          placeholder="e.g. Alex"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <div className="field">
                      <label htmlFor={`member-phone-${index}`}>Phone number</label>
                      <div className="field__control">
                        <input
                          id={`member-phone-${index}`}
                          value={member.phone}
                          onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                          placeholder="e.g. 0771234567"
                          autoComplete="off"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      className="icon-btn icon-btn--danger member-row__remove"
                      onClick={() => removeMemberRow(index)}
                      aria-label={`Remove member ${index + 1}`}
                    >
                      <Trash2 size={16} aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="submit-row">
              <button type="submit" className="btn btn--primary btn--lg" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create group'}
              </button>
              <span className="hint">
                {monthly != null
                  ? `Each month: ${formatMoney(monthly)} (total ÷ 10).`
                  : 'Monthly installment is the total ÷ 10.'}
              </span>
            </div>
          </form>
        </section>

        <section aria-labelledby="similar-groups-heading">
          <h2 id="similar-groups-heading" className="section__title">
            Similar groups ({ad.category})
          </h2>
          {loading ? (
            <div className="skeleton" aria-busy="true" />
          ) : similarGroups.length === 0 ? (
            <div className="empty">
              <h3>No similar groups yet</h3>
              <p>Be the first to start one for this product.</p>
            </div>
          ) : (
            <div className="stack">
              {similarGroups.map((group) => (
                <GroupCard key={group._id} group={group} showDelete={false} />
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}

function CreateGroupPage() {
  const { adId } = useParams();
  const ad = getAdById(adId);

  if (!ad) return <Navigate to="/" replace />;
  // key => form state resets if the user opens a different product
  return <CreateGroupForm key={ad.id} ad={ad} />;
}

export default CreateGroupPage;
