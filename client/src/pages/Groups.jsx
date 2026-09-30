import { useState } from 'react';
import { useGetGroupsQuery, useCreateGroupMutation, useAddGroupMemberMutation } from '../store/slices/groupsApiSlice';
import { useGetFriendsQuery, useInviteFriendMutation } from '../store/slices/friendsApiSlice';
import { Users, Plus, Loader, AlertCircle } from 'lucide-react';

const Groups = () => {
  const { data: groups, isLoading, error } = useGetGroupsQuery(undefined, { pollingInterval: 15000 });
  const { data: friends = [] } = useGetFriendsQuery();
  const [createGroup, { isLoading: isCreating }] = useCreateGroupMutation();
  const [addGroupMember, { isLoading: isAddingMember }] = useAddGroupMemberMutation();
  const [inviteFriend, { isLoading: isSendingInvite }] = useInviteFriendMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Other');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [addingToGroup, setAddingToGroup] = useState(null);
  const [memberToAdd, setMemberToAdd] = useState('');
  const [groupInviteEmail, setGroupInviteEmail] = useState('');
  const [inviteFeedback, setInviteFeedback] = useState('');
  const [groupInviteLink, setGroupInviteLink] = useState('');
  const [isInviteError, setIsInviteError] = useState(false);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      await createGroup({ name, description, category, members: selectedMembers }).unwrap();
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setCategory('Other');
      setSelectedMembers([]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMember = async (groupId) => {
    if (!memberToAdd) return;
    try {
      await addGroupMember({ groupId, userId: memberToAdd }).unwrap();
      setAddingToGroup(null);
      setMemberToAdd('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleInviteToGroup = async (groupId) => {
    const email = groupInviteEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email)) {
      setInviteFeedback('Enter a valid email address');
      setIsInviteError(true);
      return;
    }
    try {
      const result = await inviteFriend({ email, groupId }).unwrap();
      setInviteFeedback(result.message);
      setGroupInviteLink(result.inviteLink || '');
      setIsInviteError(false);
      setGroupInviteEmail('');
    } catch (err) {
      setInviteFeedback(err?.data?.message || 'Could not send the invitation');
      setGroupInviteLink('');
      setIsInviteError(true);
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader className="animate-spin text-primary" size={32} /></div>;
  if (error) return <div className="text-red-500 flex items-center gap-2"><AlertCircle /> Error loading groups</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Your Groups</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your shared expenses with friends and family.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="shrink-0 flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-3 sm:px-4 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <Plus size={18} /> <span className="hidden sm:inline">Create Group</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups?.length > 0 ? (
          groups.map(group => (
            <div key={group._id} className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-gray-100 card-hover flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <Users size={24} />
                </div>
                <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg">{group.category}</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2 flex-grow">{group.description || 'No description'}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 text-sm text-gray-500">
                <div className="flex items-center justify-between gap-3">
                  <span>{group.members.length} {group.members.length === 1 ? 'member' : 'members'}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingToGroup(addingToGroup === group._id ? null : group._id);
                      setMemberToAdd('');
                      setInviteFeedback('');
                      setGroupInviteLink('');
                      setIsInviteError(false);
                      setGroupInviteEmail('');
                    }}
                    className="text-primary font-medium hover:underline"
                  >
                    Add friends
                  </button>
                </div>
                {addingToGroup === group._id && (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <select
                        aria-label={`Choose a friend to add to ${group.name}`}
                        value={memberToAdd}
                        onChange={(event) => setMemberToAdd(event.target.value)}
                        className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                      >
                        <option value="">Choose a friend</option>
                        {friends
                          .filter((friend) => !group.members.some((member) => member._id === friend._id))
                          .map((friend) => <option key={friend._id} value={friend._id}>{friend.name}</option>)}
                      </select>
                      <button
                        type="button"
                        disabled={!memberToAdd || isAddingMember}
                        onClick={() => handleAddMember(group._id)}
                        className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                      >
                        {isAddingMember ? 'Adding...' : 'Add'}
                      </button>
                    </div>
                    <div className="border-t border-gray-100 pt-3">
                      <p className="mb-2 text-xs font-medium text-gray-600">Not a friend yet? Invite them by email</p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="email"
                          required
                          aria-label={`Email address to invite to ${group.name}`}
                          placeholder="friend@example.com"
                          value={groupInviteEmail}
                          onChange={(event) => setGroupInviteEmail(event.target.value)}
                          className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                        />
                        <button
                          type="button"
                          disabled={!groupInviteEmail.trim() || isSendingInvite}
                          onClick={() => handleInviteToGroup(group._id)}
                          className="rounded-lg border border-primary px-3 py-2 text-sm font-medium text-primary disabled:opacity-50"
                        >
                          {isSendingInvite ? 'Sending...' : 'Send invite'}
                        </button>
                      </div>
                      {inviteFeedback && <p role="status" className={`mt-2 text-xs ${isInviteError ? 'text-red-600' : 'text-emerald-700'}`}>{inviteFeedback}</p>}
                      {groupInviteLink && (
                        <div className="mt-2 flex gap-2">
                          <input aria-label="Group invitation link" readOnly value={groupInviteLink} className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 px-2 py-2 text-xs text-gray-700" />
                          <button type="button" onClick={async () => { await navigator.clipboard.writeText(groupInviteLink); setInviteFeedback('Invite link copied. Share it with your friend.'); }} className="rounded-lg border border-primary px-3 py-2 text-xs font-medium text-primary">Copy link</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-gray-100 border-dashed">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No groups yet</h3>
            <p className="text-gray-500 mt-1 mb-4">Create a group to start sharing expenses.</p>
            <button onClick={() => setIsModalOpen(true)} className="text-primary font-medium hover:underline">Create your first group</button>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[calc(100dvh-2rem)] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Create New Group</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary" placeholder="e.g. Goa Trip" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary" placeholder="What's this group for?" rows="3"></textarea>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary">
                  <option value="Travel">Travel</option>
                  <option value="Home">Home</option>
                  <option value="Couple">Couple</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">Add friends (optional)</p>
                {friends.length ? (
                  <div className="max-h-36 space-y-2 overflow-y-auto rounded-xl border border-gray-200 p-2">
                    {friends.map((friend) => (
                      <label key={friend._id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(friend._id)}
                          onChange={() => setSelectedMembers((current) => current.includes(friend._id)
                            ? current.filter((id) => id !== friend._id)
                            : [...current, friend._id])}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span className="min-w-0 truncate text-sm text-gray-700">{friend.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Add friends first, then you can include them in this group.</p>
                )}
              </div>
              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={isCreating} className="w-full sm:w-auto px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-70">{isCreating ? 'Creating...' : 'Create Group'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
