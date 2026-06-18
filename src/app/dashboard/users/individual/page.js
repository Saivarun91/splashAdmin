'use client';

import { User, Search, Eye, Coins, PlusCircle, MinusCircle, X, Save, AlertCircle, Calendar, FolderKanban, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { individualUserAPI } from '@/lib/api';

export default function IndividualUsersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
  const [showRemoveCreditsModal, setShowRemoveCreditsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [creditFormData, setCreditFormData] = useState({ amount: '', reason: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await individualUserAPI.getAll();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to fetch individual users:', err);
      setError('Failed to load individual users. Please try again.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddCredits = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const amount = parseInt(creditFormData.amount, 10);
      if (!amount || amount <= 0) {
        setError('Please enter a valid amount greater than 0');
        return;
      }
      const response = await individualUserAPI.addCredits(
        selectedUser.id,
        amount,
        creditFormData.reason || 'Credit top-up by admin'
      );
      if (response.success) {
        setSuccess(`Successfully added ${amount} credits! New balance: ${response.balance_after}`);
        setShowAddCreditsModal(false);
        setCreditFormData({ amount: '', reason: '' });
        await fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to add credits');
    }
  };

  const handleRemoveCredits = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const amount = parseInt(creditFormData.amount, 10);
      if (!amount || amount <= 0) {
        setError('Please enter a valid amount greater than 0');
        return;
      }
      if (amount > selectedUser.credit_balance) {
        setError(`Cannot remove ${amount} credits. User only has ${selectedUser.credit_balance} credits.`);
        return;
      }
      const response = await individualUserAPI.removeCredits(
        selectedUser.id,
        amount,
        creditFormData.reason || 'Credit deduction by admin'
      );
      if (response.success) {
        setSuccess(`Successfully removed ${amount} credits! New balance: ${response.balance_after}`);
        setShowRemoveCreditsModal(false);
        setCreditFormData({ amount: '', reason: '' });
        await fetchUsers();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to remove credits');
    }
  };

  const filteredUsers = users.filter((user) =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-gray-500 dark:text-gray-400">Loading individual users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
          Individual Users
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
          Manage users who are not part of any organization
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, username, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Individual Users</p>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{users.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
          <p className="text-sm font-medium text-green-900 dark:text-green-300">Total Credits</p>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
            {users.reduce((sum, user) => sum + (user.credit_balance || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Total Images</p>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
            {users.reduce((sum, user) => sum + (user.images_count || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {success && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="text-green-600 dark:text-green-400" size={20} />
          <span className="text-green-800 dark:text-green-200">{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="text-red-600 dark:text-red-400" size={20} />
          <span className="text-red-800 dark:text-red-200">{error}</span>
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
          <User className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Individual Users Found</h3>
          <p className="text-gray-600 dark:text-gray-400">Users without an organization will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-start gap-3 mb-4">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-md">
                  <User className="text-white" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
                    {user.full_name || user.username || 'Unnamed User'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Coins size={16} />
                  <span>{user.credit_balance?.toLocaleString() || 0} credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <FolderKanban size={16} />
                  <span>{user.projects_count || 0} projects</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon size={16} />
                  <span>{user.images_count || 0} images</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => router.push(`/dashboard/users/individual/${user.id}`)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  <Eye size={16} />
                  View Details
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setCreditFormData({ amount: '', reason: '' });
                      setShowAddCreditsModal(true);
                      setError('');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    <PlusCircle size={16} />
                    Add Credits
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setCreditFormData({ amount: '', reason: '' });
                      setShowRemoveCreditsModal(true);
                      setError('');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    <MinusCircle size={16} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddCreditsModal && selectedUser && (
        <CreditModal
          title="Add Credits"
          user={selectedUser}
          creditFormData={creditFormData}
          setCreditFormData={setCreditFormData}
          onClose={() => {
            setShowAddCreditsModal(false);
            setCreditFormData({ amount: '', reason: '' });
            setError('');
          }}
          onSubmit={handleAddCredits}
          error={error}
          submitLabel="Add Credits"
          submitClass="from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
        />
      )}

      {showRemoveCreditsModal && selectedUser && (
        <CreditModal
          title="Remove Credits"
          user={selectedUser}
          creditFormData={creditFormData}
          setCreditFormData={setCreditFormData}
          onClose={() => {
            setShowRemoveCreditsModal(false);
            setCreditFormData({ amount: '', reason: '' });
            setError('');
          }}
          onSubmit={handleRemoveCredits}
          error={error}
          submitLabel="Remove Credits"
          submitClass="from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800"
          maxAmount={selectedUser.credit_balance}
        />
      )}
    </div>
  );
}

function CreditModal({ title, user, creditFormData, setCreditFormData, onClose, onSubmit, error, submitLabel, submitClass, maxAmount }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            User: <strong className="text-gray-900 dark:text-white">{user.full_name || user.email}</strong>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Current Balance: <strong>{user.credit_balance?.toLocaleString() || 0} credits</strong>
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amount *</label>
            <input
              type="number"
              required
              min="1"
              max={maxAmount}
              value={creditFormData.amount}
              onChange={(e) => setCreditFormData({ ...creditFormData, amount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason (Optional)</label>
            <input
              type="text"
              value={creditFormData.reason}
              onChange={(e) => setCreditFormData({ ...creditFormData, reason: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          {error && <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              Cancel
            </button>
            <button type="submit" className={`flex-1 px-4 py-2 bg-gradient-to-r ${submitClass} text-white rounded-lg transition-all flex items-center justify-center gap-2`}>
              <Save size={18} />
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
