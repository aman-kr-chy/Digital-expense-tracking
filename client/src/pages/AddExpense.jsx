import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAddGroupMemberMutation, useGetGroupsQuery } from '../store/slices/groupsApiSlice';
import { useGetFriendsQuery } from '../store/slices/friendsApiSlice';
import { useAddExpenseMutation } from '../store/slices/expensesApiSlice';
import { Receipt, Users, PlusCircle, AlertCircle } from 'lucide-react';

const AddExpense = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  
  const { data: groups } = useGetGroupsQuery();
  const { data: friends } = useGetFriendsQuery();
  const [addExpense, { isLoading }] = useAddExpenseMutation();
  const [addGroupMember, { isLoading: isAddingMember }] = useAddGroupMemberMutation();

  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Other');
  const [groupId, setGroupId] = useState('');
  const [splitMethod, setSplitMethod] = useState('EQUAL');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [friendToAdd, setFriendToAdd] = useState('');

  const selectedGroup = groups?.find(g => g._id === groupId);
  const displayUsers = selectedGroup 
    ? selectedGroup.members.filter(m => m._id !== userInfo._id) 
    : friends;

  const handleGroupChange = (e) => {
    const newGroupId = e.target.value;
    setGroupId(newGroupId);
    
    if (newGroupId) {
      const group = groups?.find(g => g._id === newGroupId);
      if (group) {
        setSelectedFriends(group.members.filter(m => m._id !== userInfo._id).map(m => m._id));
      }
    } else {
      setSelectedFriends([]);
    }
  };

  const handleFriendSelection = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter(id => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const handleAddGroupMember = async () => {
    if (!selectedGroup || !friendToAdd) return;
    try {
      await addGroupMember({ groupId: selectedGroup._id, userId: friendToAdd }).unwrap();
      setSelectedFriends((current) => [...new Set([...current, friendToAdd])]);
      setFriendToAdd('');
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err?.data?.message || 'Could not add this friend to the group');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !amount) {
      setErrorMsg('Title and amount are required');
      return;
    }

    // For equal split, all selected friends + the current user are involved.
    const allParticipants = [userInfo._id, ...selectedFriends];
    
    if (allParticipants.length < 2) {
      setErrorMsg(`You must select at least one ${selectedGroup ? 'group member' : 'friend'} to split with`);
      return;
    }

    const splits = allParticipants.map(userId => ({
      user: userId,
      // The backend calculateSplits function will handle the exact amounts for EQUAL
    }));

    try {
      await addExpense({
        title,
        amount: Number(amount),
        category,
        group: groupId || null,
        splitMethod,
        splits
      }).unwrap();
      
      navigate('/');
    } catch (err) {
      setErrorMsg(err?.data?.message || err.error || 'Failed to add expense');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add an Expense</h1>
          <p className="text-gray-500 text-sm mt-1">Split expenses easily with anyone.</p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expense Description</label>
              <div className="relative">
                <Receipt className="absolute left-3 top-2.5 text-gray-400" size={20} />
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Dinner at Taj..." 
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-2.5 text-gray-500 font-medium">₹</span>
                <input 
                  type="number" 
                  step="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00" 
                  className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary font-medium text-lg"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select 
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary"
              >
                {['Food', 'Hotel', 'Travel', 'Shopping', 'Rent', 'Bills', 'Entertainment', 'Other'].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4 bg-gray-50 p-5 rounded-xl border border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Associate with Group (Optional)</label>
              <select 
                value={groupId}
                onChange={handleGroupChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary bg-white"
              >
                <option value="">No Group</option>
                {groups?.map(group => (
                  <option key={group._id} value={group._id}>{group.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Split with {selectedGroup ? 'Group Members' : 'Friends'}</label>
              <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {displayUsers?.map(user => (
                  <label key={user._id} className="flex items-center p-3 bg-white border border-gray-200 rounded-xl cursor-pointer hover:border-primary transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded mr-3" 
                      checked={selectedFriends.includes(user._id)}
                      onChange={() => handleFriendSelection(user._id)}
                    />
                    <div className="w-8 h-8 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-xs mr-3">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.name}</span>
                  </label>
                ))}
                {(!displayUsers || displayUsers.length === 0) && (
                  <div className="text-sm text-gray-500 italic p-2">
                    {selectedGroup ? (
                      <div className="not-italic space-y-2">
                        <p>This group has no other members yet. Add a friend to split this expense.</p>
                        {friends?.length ? (
                          <div className="flex flex-col sm:flex-row gap-2">
                            <select
                              aria-label="Choose a friend to add to this group"
                              value={friendToAdd}
                              onChange={(event) => setFriendToAdd(event.target.value)}
                              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                            >
                              <option value="">Choose a friend</option>
                              {friends.filter((friend) => !selectedGroup.members.some((member) => member._id === friend._id))
                                .map((friend) => <option key={friend._id} value={friend._id}>{friend.name}</option>)}
                            </select>
                            <button
                              type="button"
                              disabled={!friendToAdd || isAddingMember}
                              onClick={handleAddGroupMember}
                              className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                            >
                              {isAddingMember ? 'Adding...' : 'Add friend'}
                            </button>
                          </div>
                        ) : (
                          <p>Add someone from <Link to="/friends" className="font-medium text-primary underline">Friends</Link> first.</p>
                        )}
                      </div>
                    ) : (
                      <>You need to add friends first. Visit <Link to="/friends" className="font-medium text-primary underline">Friends</Link> to add someone.</>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <button 
            type="button" 
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full sm:w-auto justify-center px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-xl font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70"
          >
            {isLoading ? 'Adding...' : <><PlusCircle size={18} /> Add Expense</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpense;
