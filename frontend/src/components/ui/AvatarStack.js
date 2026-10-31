import { getInitials } from '../../utils';

function AvatarStack({ members = [], max = 4 }) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;

  if (members.length === 0) return <span className="avatars__empty">No members yet</span>;

  return (
    <span className="avatars" aria-hidden>
      {shown.map((m) => (
        <span key={m.phone} className="avatar" title={m.name}>
          {getInitials(m.name)}
        </span>
      ))}
      {extra > 0 && <span className="avatar avatar--more">+{extra}</span>}
    </span>
  );
}

export default AvatarStack;
