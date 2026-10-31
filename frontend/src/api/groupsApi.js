import client from './client';

export const listGroups = () =>
  client.get('/groups').then((r) => (Array.isArray(r.data) ? r.data : []));

export const createGroup = (payload) => client.post('/groups', payload).then((r) => r.data);

export const deleteGroup = (id, requesterEmail) =>
  client.delete(`/groups/${id}`, { params: { requesterEmail } });

export const addMember = (groupId, payload) => client.post(`/groups/${groupId}/members`, payload);

export const removeMember = (groupId, phone, requesterEmail) =>
  client.delete(`/groups/${groupId}/members/${encodeURIComponent(phone)}`, {
    params: { requesterEmail },
  });

export const bulkAddMembers = (groupId, payload) =>
  client.post(`/groups/${groupId}/members/bulk`, payload);

export const bulkRemoveMembers = (groupId, payload) =>
  client.delete(`/groups/${groupId}/members`, { data: payload });
