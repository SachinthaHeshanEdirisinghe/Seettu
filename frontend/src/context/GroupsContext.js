import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as groupsApi from '../api/groupsApi';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { getErrorMessage, parseBulkMembers } from '../utils';

const GroupsContext = createContext(null);

export function GroupsProvider({ children }) {
  const { user, updateProfile } = useAuth();
  const notify = useToast();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyGroupId, setBusyGroupId] = useState(null);

  const email = user?.email || '';

  // silent = refetch in the background (no skeleton), so open cards keep their state
  const refresh = useCallback(
    async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      setGroups(await groupsApi.listGroups());
    } catch (err) {
      setGroups([]);
      notify.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
    },
    [notify]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  /** Runs an action, toasts the result, and optionally reloads groups. */
  const run = useCallback(
    async (action, successMessage, { reload = true, groupId = null } = {}) => {
      if (groupId) setBusyGroupId(groupId);
      try {
        const result = await action();
        if (successMessage) notify.success(successMessage);
        if (reload) await refresh({ silent: true });
        return { ok: true, result };
      } catch (err) {
        notify.error(getErrorMessage(err));
        return { ok: false };
      } finally {
        if (groupId) setBusyGroupId(null);
      }
    },
    [notify, refresh]
  );

  const actions = useMemo(
    () => ({
      createGroup: (payload) =>
        run(() => groupsApi.createGroup({ ...payload, creatorEmail: email }), null),

      deleteGroup: async (id) => {
        const res = await run(() => groupsApi.deleteGroup(id, email), 'Group removed.', {
          reload: false,
          groupId: id,
        });
        if (res.ok) setGroups((prev) => prev.filter((g) => g._id !== id));
        return res;
      },

      joinGroup: (id) =>
        run(
          () => groupsApi.addMember(id, { name: user.name, phone: user.phone }),
          'You joined the group.',
          { groupId: id }
        ),

      leaveGroup: (id) =>
        run(() => groupsApi.removeMember(id, user.phone, email), 'You left the group.', {
          groupId: id,
        }),

      addMember: (id, { name, phone }) =>
        run(
          () =>
            groupsApi.addMember(id, {
              name,
              phone,
              requesterPhone: user?.phone || '',
              requesterEmail: email,
            }),
          'Member added.',
          { groupId: id }
        ),

      removeMember: (id, phone) =>
        run(() => groupsApi.removeMember(id, phone, email), 'Member removed.', { groupId: id }),

      bulkAddMembers: async (id, text) => {
        const members = parseBulkMembers(text);
        if (members.length === 0) {
          notify.error('Add at least one line in the format: Name, Phone');
          return { ok: false };
        }
        return run(
          () => groupsApi.bulkAddMembers(id, { members, requesterEmail: email }),
          `${members.length} member${members.length > 1 ? 's' : ''} added.`,
          { groupId: id }
        );
      },

      bulkRemoveMembers: (id, phones) =>
        run(
          () => groupsApi.bulkRemoveMembers(id, { phones, requesterEmail: email }),
          `${phones.length} member${phones.length > 1 ? 's' : ''} removed.`,
          { groupId: id }
        ),

      updateProfile: async (name, phone) => {
        try {
          await updateProfile({ name, phone });
          notify.success('Profile updated.');
          await refresh({ silent: true }); // member names/phones cascade into groups
          return { ok: true };
        } catch (err) {
          notify.error(getErrorMessage(err));
          return { ok: false };
        }
      },
    }),
    [run, email, user, notify, refresh, updateProfile]
  );

  const value = useMemo(
    () => ({ groups, loading, busyGroupId, refresh, ...actions }),
    [groups, loading, busyGroupId, refresh, actions]
  );

  return <GroupsContext.Provider value={value}>{children}</GroupsContext.Provider>;
}

export const useGroups = () => {
  const ctx = useContext(GroupsContext);
  if (!ctx) throw new Error('useGroups must be used inside GroupsProvider');
  return ctx;
};
