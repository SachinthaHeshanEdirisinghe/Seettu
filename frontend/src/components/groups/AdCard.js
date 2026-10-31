import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import CategoryIcon from '../ui/CategoryIcon';

function AdCard({ ad }) {
  return (
    <article className="ad-card">
      <span className="ad-card__icon">
        <CategoryIcon category={ad.category} size={22} />
      </span>
      <div className="ad-card__body">
        <span className="ad-card__tag">{ad.tag}</span>
        <h3 className="ad-card__title">{ad.title}</h3>
        <p className="ad-card__blurb">{ad.blurb}</p>
      </div>
      <div className="ad-card__foot">
        <strong className="ad-card__price">{ad.price}</strong>
        <Link to={`/create-group/${ad.id}`} className="btn btn--secondary btn--sm">
          <Plus size={15} aria-hidden /> Create group
        </Link>
      </div>
    </article>
  );
}

export default AdCard;
