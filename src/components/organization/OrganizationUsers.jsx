'use client';

import { Users, Mail, Calendar, User as UserIcon, Shield, Search, Plus, X, AlertCircle, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useState } from 'react';
import { organizationAPI } from '@/lib/api';

// eslint-disable-next-line react/prop-types
export function OrganizationUsers({ organization, onUserAdded }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [formData, setFormData] = useState({ user_email: '', organization_role: 'member' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);
  
  // Check if current user is admin
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('user_role') === 'admin';

  // Prepare user data
  const members = organization?.members || [];
  const ownerEmail = organization?.owner_email || organization?.owner?.email;

  // Combine owner and members
  const allUsers = ownerEmail
    ? [
        {
          id: 'owner',
          email: ownerEmail,
          full_name: ownerEmail.split('@')[0],
          role: 'owner',
          isOwner: true,
          organization_role: 'owner',
        },
        ...members.filter((m) => m.email !== ownerEmail),
      ]
    : members;

  // Filter users based on search query
  const filteredUsers = allUsers.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      (user.full_name || user.user_name || '').toLowerCase().includes(query) ||
      (user.email || user.user_email || '').toLowerCase().includes(query) ||
      (user.username || '').toLowerCase().includes(query)
    );
  });

  const getRoleBadge = (role, isOwner) => {
    if (isOwner || role === 'owner') {
      return (
        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
          <Shield size={12} className="mr-1" />
          Owner
        </Badge>
      );
    }
    
    // Map role values to display names
    const roleDisplayMap = {
      'chief_editor': 'Chief Editor',
      'creative_head': 'Creative Head',
      'member': 'Member',
      'Chief Editor': 'Chief Editor',
      'Creative Head': 'Creative Head',
      'Member': 'Member',
    };
    
    const roleDisplay = roleDisplayMap[role] || role || 'Member';
    
    let badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    if (role === 'chief_editor' || role === 'Chief Editor') {
      badgeColor = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300';
    } else if (role === 'creative_head' || role === 'Creative Head') {
      badgeColor = 'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-300';
    }
    
    return (
      <Badge className={badgeColor}>
        <UserIcon size={12} className="mr-1" />
        {roleDisplay}
      </Badge>
    );
  };

  const getInitials = (name, email) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return '?';
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.user_email) {
        setError('Email is required');
        setLoading(false);
        return;
      }

      const response = await organizationAPI.addUser({
        user_email: formData.user_email,
        organization_id: organization.id,
        organization_role: formData.organization_role,
      });

      if (response.success) {
        setSuccess('User added successfully!');
        setShowAddUserModal(false);
        setFormData({ user_email: '', organization_role: 'member' });
        
        // Call the callback to refresh organization data
        if (onUserAdded) {
          onUserAdded();
        }
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.message || 'Failed to add user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to remove ${userEmail} from this organization?`)) {
      return;
    }

    setDeletingUserId(userId);
    setError('');
    setSuccess('');

    try {
      const response = await organizationAPI.removeUser(organization.id, userId);

      if (response.success) {
        setSuccess('User removed successfully!');
        
        // Call the callback to refresh organization data
        if (onUserAdded) {
          onUserAdded();
        }
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.message || 'Failed to remove user');
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Team Members</h3>
          <p className="text-gray-600 dark:text-gray-400">Manage and view all members in this organization</p>
        </div>
        <button
          onClick={() => {
            setShowAddUserModal(true);
            setError('');
            setSuccess('');
            setFormData({ user_email: '', organization_role: 'member' });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-sm font-medium"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Success/Error Messages */}
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-6 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/10 dark:to-blue-800/10">
          <div className="flex items-start justify-between mb-4">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-semibold uppercase tracking-wide">Total Users</span>
            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center shadow-sm">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">{allUsers.length}</div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Active members</p>
        </Card>

        <Card className="p-6 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/10 dark:to-purple-800/10">
          <div className="flex items-start justify-between mb-4">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-semibold uppercase tracking-wide">Organization Owner</span>
            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center shadow-sm">
              <Shield className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400 truncate">
            {ownerEmail ? ownerEmail.split('@')[0] : 'N/A'}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Primary administrator</p>
        </Card>

        <Card className="p-6 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/10 dark:to-green-800/10">
          <div className="flex items-start justify-between mb-4">
            <span className="text-gray-700 dark:text-gray-300 text-sm font-semibold uppercase tracking-wide">Created On</span>
            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center shadow-sm">
              <Calendar className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-xl font-bold text-green-600 dark:text-green-400">
            {organization?.created_at ? new Date(organization.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Organization start date</p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {/* Users List */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              className="p-6 border-gray-200 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 bg-white dark:bg-gray-900"
            >
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16 ring-2 ring-gray-100 dark:ring-gray-800">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email || user.user_email || user.id}`}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-lg font-semibold">
                    {getInitials(user.full_name || user.user_name, user.email || user.user_email)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white truncate mb-1">
                        {user.full_name || user.user_name || 'Unknown User'}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400 flex-shrink-0" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {user.email || user.user_email || 'No email'}
                        </p>
                      </div>
                    </div>
                    {isAdmin && !user.isOwner && user.id !== 'owner' && (
                      <button
                        onClick={() => handleDeleteUser(user.id || user.user_id, user.email || user.user_email)}
                        disabled={deletingUserId === (user.id || user.user_id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove user from organization"
                      >
                        {deletingUserId === (user.id || user.user_id) ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                    {getRoleBadge(user.organization_role || user.role, user.isOwner)}
                    {user.username && (
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">@{user.username}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 text-lg font-semibold mb-2">No users found</p>
          <p className="text-gray-500 dark:text-gray-500 text-sm">
            {searchQuery ? 'Try adjusting your search terms.' : 'No users match your search criteria.'}
          </p>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add User to Organization</h2>
              <button
                onClick={() => {
                  setShowAddUserModal(false);
                  setFormData({ user_email: '', organization_role: 'member' });
                  setError('');
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Organization: <strong className="text-gray-900 dark:text-white">{organization?.name}</strong>
              </p>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.user_email}
                  onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="user@example.com"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  The user must already exist in the system. If not, they will need to register first.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization Role *
                </label>
                <select
                  value={formData.organization_role}
                  onChange={(e) => setFormData({ ...formData, organization_role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="member">Member</option>
                  <option value="chief_editor">Chief Editor</option>
                  <option value="creative_head">Creative Head</option>
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select the role for this user in the organization
                </p>
              </div>
              {error && (
                <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUserModal(false);
                    setFormData({ user_email: '', organization_role: 'member' });
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      Add User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

