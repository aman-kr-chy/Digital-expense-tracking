import { useSelector } from 'react-redux';
import { useGetDashboardStatsQuery } from '../store/slices/dashboardApiSlice';
import { ArrowUpRight, ArrowDownRight, IndianRupee, Wallet, Clock, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: stats, isLoading, error } = useGetDashboardStatsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-xl">
        Failed to load dashboard data.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, {userInfo?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">Here is your financial summary.</p>
        </div>
        <Link 
          to="/add-expense" 
          className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
        >
          <span className="text-xl leading-none">+</span> Add Expense
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 card-hover">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <ArrowDownRight className="text-red-500 bg-red-50 p-1.5 rounded-lg" size={32} />
            <h3 className="font-medium">You owe</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <IndianRupee size={24} className="text-gray-400 mr-1" />
            {stats?.youOwe?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 card-hover">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <ArrowUpRight className="text-green-500 bg-green-50 p-1.5 rounded-lg" size={32} />
            <h3 className="font-medium">Others owe you</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <IndianRupee size={24} className="text-gray-400 mr-1" />
            {stats?.othersOweYou?.toFixed(2) || '0.00'}
          </p>
        </div>

        <div className={`p-4 sm:p-6 rounded-2xl shadow-sm border card-hover text-white ${stats?.netBalance >= 0 ? 'bg-primary border-primary-dark' : 'bg-red-500 border-red-600'}`}>
          <div className="flex items-center gap-3 text-white/80 mb-2">
            <Wallet className="bg-white/20 p-1.5 rounded-lg" size={32} />
            <h3 className="font-medium">Net Balance</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold flex items-center">
            {stats?.netBalance >= 0 ? '+' : '-'}
            <IndianRupee size={24} className="text-white/70 mx-1" />
            {Math.abs(stats?.netBalance || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Expenses */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Recent Expenses</h3>
            <Link to="/expenses" className="text-sm font-medium text-primary hover:text-primary-dark">View All</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.recentExpenses?.length > 0 ? (
              stats.recentExpenses.map((expense) => (
                <div key={expense._id} className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                  <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                      <Clock size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{expense.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(expense.date).toLocaleDateString()} • Paid by {expense?.paidBy?.name === userInfo?.name ? 'you' : expense?.paidBy?.name || 'someone'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 flex items-center justify-end">
                      <IndianRupee size={14} />{expense.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                No recent expenses found.
              </div>
            )}
          </div>
        </div>

        {/* Recent Settlements */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Recent Settlements</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {stats?.recentSettlements?.length > 0 ? (
              stats.recentSettlements.map((settlement) => {
                const isPayer = settlement.payer._id === userInfo._id;
                return (
                  <div key={settlement._id} className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${isPayer ? 'bg-green-500' : 'bg-blue-500'}`}>
                        {isPayer ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 text-sm">
                          {isPayer 
                            ? `You paid ${settlement?.payee?.name || 'someone'}` 
                            : `${settlement?.payer?.name || 'Someone'} paid you`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(settlement.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold flex items-center justify-end ${isPayer ? 'text-green-600' : 'text-gray-900'}`}>
                        {isPayer ? '+' : ''}
                        <IndianRupee size={14} />
                        {settlement.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                No recent settlements.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Add Expense FAB */}
      <Link 
        to="/add-expense" 
        className="sm:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors z-10"
      >
        <PlusCircle size={28} />
      </Link>
    </div>
  );
};

export default Dashboard;
