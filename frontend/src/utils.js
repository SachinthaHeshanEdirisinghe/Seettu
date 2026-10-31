import axios from 'axios';

export const getErrorMessage = (err) => {
  if (axios.isAxiosError(err)) {
    if (!err.response) {
      return 'Cannot reach the server. Is the backend running at http://localhost:5000?';
    }
    const data = err.response.data;
    if (typeof data === 'object' && data !== null && data.message) {
      return String(data.message);
    }
    return err.response.statusText || `Request failed (${err.response.status})`;
  }
  return err?.message || 'Something went wrong.';
};

export const formatMoney = (n) =>
  typeof n === 'number' && !Number.isNaN(n)
    ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)
    : '—';

export const monthlyInstallment = (total) =>
  typeof total === 'number' && !Number.isNaN(total) ? total / 10 : null;

export const getSimilarGroups = (groups, ad) => {
  if (!ad || !Array.isArray(groups)) return [];
  const titleLower = ad.title.toLowerCase();
  return groups.filter((group) => {
    if (group.category === ad.category) return true;
    const productName = typeof group.productName === 'string' ? group.productName.toLowerCase() : '';
    return productName.includes(titleLower) || titleLower.includes(productName);
  });
};

/** "Alex, 0710001000" per line -> [{ name, phone }] (invalid lines are skipped) */
export const parseBulkMembers = (text) =>
  String(text || '')
    .split('\n')
    .map((line) => line.split(','))
    .filter((parts) => parts.length >= 2)
    .map(([name, phone]) => ({ name: name.trim(), phone: phone.trim() }))
    .filter((m) => m.name && m.phone);

export const getInitials = (name) =>
  String(name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?';

export const getFirstName = (name) => String(name || '').trim().split(/\s+/)[0] || 'there';
