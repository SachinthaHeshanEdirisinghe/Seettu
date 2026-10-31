import client from './client';

export const fetchMe = (email) => client.get('/auth/me', { params: { email } }).then((r) => r.data.user || null);

export const signIn = (payload) => client.post('/auth/signin', payload).then((r) => r.data.user);

export const signUp = (payload) => client.post('/auth/signup', payload).then((r) => r.data.user);

export const updateProfile = (payload) => client.put('/auth/update', payload).then((r) => r.data.user);
