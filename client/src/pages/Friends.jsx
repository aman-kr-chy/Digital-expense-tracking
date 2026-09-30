import { useState } from 'react';
import { useGetFriendsQuery, useGetUsersQuery, useSendFriendRequestMutation, useInviteFriendMutation } from '../store/slices/friendsApiSlice';
import { UserPlus, Search, AlertCircle, Loader, Mail } from 'lucide-react';

const Friends = () => {
  const { data: friends, isLoading } = useGetFriendsQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: searchResults, isFetching } = useGetUsersQuery(searchTerm, {
    skip: searchTerm.length < 2,
  });
  
  const [sendRequest, { isLoading: isSending }] = useSendFriendRequestMutation();
  const [inviteFriend, { isLoading: isInviting }] = useInviteFriendMutation();
  const [message, setMessage] = useState('');
  const [showEmailInput, setShowEmailInput] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');

  const handleSendRequest = async (id) => {
    try {
      await sendRequest({ receiverId: id }).unwrap();
      setMessage('Friend request sent!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err?.data?.message || 'Error sending request');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail) return;
    try {
      const res = await inviteFriend({ email: inviteEmail }).unwrap();
      setMessage(res.message);
      setInviteLink(res.inviteLink || '');
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setMessage(err?.data?.message || 'Error sending invitation');
      setInviteLink('');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Friends</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your friends and send requests.</p>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-blue-50 text-blue-700 rounded-xl flex items-center gap-2">
          <AlertCircle size={18} /> {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Your Friends</h3>
            </div>
            
            {isLoading ? (
              <div className="p-8 flex justify-center"><Loader className="animate-spin text-primary" /></div>
            ) : friends?.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {friends.map(friend => (
                  <div key={friend._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/20 text-primary font-bold rounded-full flex items-center justify-center">
                        {friend.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{friend.name}</p>
                        <p className="text-xs text-gray-500">{friend.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <UserPlus size={40} className="mx-auto mb-3 text-gray-300" />
                <p>You haven't added any friends yet.</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <h3 className="font-bold text-gray-900 mb-4">Add new friend</h3>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary text-sm"
              />
            </div>
            
            <div className="space-y-3">
              {isFetching ? (
                <div className="flex justify-center p-4"><Loader className="animate-spin text-primary" size={20}/></div>
              ) : searchResults?.length > 0 ? (
                searchResults.map(user => (
                  <div key={user._id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                    <div className="flex items-center gap-2 overflow-hidden">
                       <div className="w-8 h-8 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-gray-600">
                          {user.name.charAt(0)}
                       </div>
                       <div className="min-w-0">
                         <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => handleSendRequest(user._id)}
                      disabled={isSending}
                      className="p-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-colors flex-shrink-0"
                    >
                      <UserPlus size={16} />
                    </button>
                  </div>
                ))
              ) : searchTerm.length >= 2 ? (
                <p className="text-sm text-gray-500 text-center py-2">No users found.</p>
              ) : null}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Can't find your friend?</h3>
              <p className="text-xs text-gray-500 mb-4">Send them an invite link to join SplitEase.</p>
              
              {!showEmailInput ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEmailInput(true)}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 border border-transparent bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors"
                  >
                    <Mail size={16} />
                    Email Invite
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <input 
                    type="email" 
                    placeholder="Friend's email address..." 
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary text-sm"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSendInvite}
                      disabled={isInviting || !inviteEmail}
                      className="flex-1 bg-primary text-white py-2 rounded-xl text-sm font-medium hover:bg-primary-dark disabled:opacity-70 transition-colors"
                    >
                      {isInviting ? 'Sending...' : 'Send Invite'}
                    </button>
                    <button 
                      onClick={() => setShowEmailInput(false)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  {inviteLink && (
                    <div className="space-y-2">
                      <input aria-label="Friend invitation link" readOnly value={inviteLink} className="w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-xl text-xs text-gray-700" />
                      <button type="button" onClick={async () => { await navigator.clipboard.writeText(inviteLink); setMessage('Invite link copied. Share it with your friend.'); }} className="w-full border border-primary text-primary py-2 rounded-xl text-sm font-medium">Copy invite link</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Friends;
