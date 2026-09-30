import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetFriendsQuery } from '../store/slices/friendsApiSlice';
import { useAddSettlementMutation } from '../store/slices/settlementsApiSlice';
import { IndianRupee, ArrowRightLeft, CreditCard, Landmark, Banknote } from 'lucide-react';

const SettleUp = () => {
  const [payeeId, setPayeeId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  
  const navigate = useNavigate();
  const { data: friends, isLoading: isLoadingFriends } = useGetFriendsQuery();
  const [addSettlement, { isLoading: isSubmitting }] = useAddSettlementMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!payeeId || !amount) return;

    try {
      await addSettlement({
        payeeId,
        amount: Number(amount),
        paymentMethod
      }).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Failed to settle up:', err);
      alert(err?.data?.message || 'Failed to record settlement');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 md:p-8">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
          <div className="bg-green-100 p-3 rounded-xl text-green-600">
            <ArrowRightLeft size={28} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Settle Up</h1>
            <p className="text-gray-500 mt-1">Record a payment to a friend</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Who did you pay?</label>
            <select
              required
              value={payeeId}
              onChange={(e) => setPayeeId(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white transition-colors outline-none"
            >
              <option value="">Select a friend</option>
              {friends?.map((friend) => (
                <option key={friend._id} value={friend._id}>
                  {friend.name} ({friend.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <IndianRupee className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-primary focus:border-primary bg-gray-50 focus:bg-white transition-colors outline-none text-lg font-medium"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: 'Cash', icon: Banknote, label: 'Cash' },
                { id: 'UPI', icon: CreditCard, label: 'UPI / Online' },
                { id: 'Bank Transfer', icon: Landmark, label: 'Bank' }
              ].map((method) => (
                <div
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`cursor-pointer border rounded-xl p-2.5 sm:p-4 flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === method.id 
                      ? 'border-primary bg-primary/5 text-primary' 
                      : 'border-gray-200 hover:border-primary/50 text-gray-500'
                  }`}
                >
                  <method.icon size={24} />
                  <span className="text-sm font-medium">{method.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingFriends}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Recording...' : 'Save Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettleUp;
