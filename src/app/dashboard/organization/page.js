'use client';

import { Building2, Users, Calendar, Search, Filter, Download, Plus, Eye, Edit, MoreVertical, Trash2, X, Save, AlertCircle, Coins, PlusCircle, MinusCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { organizationAPI } from '@/lib/api';

export default function OrganizationPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddCreditsModal, setShowAddCreditsModal] = useState(false);
  const [showRemoveCreditsModal, setShowRemoveCreditsModal] = useState(false);
  const [showViewCreditsModal, setShowViewCreditsModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [formData, setFormData] = useState({ name: '', owner_email: '', initial_credits: 0 });
  const [creditFormData, setCreditFormData] = useState({ amount: '', reason: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchOrganizations = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await organizationAPI.getAll();
      if (data.organizations) {
        // Transform backend data to match frontend format
        const transformed = data.organizations.map((org) => ({
          id: org.id,
          name: org.name,
          owner: org.owner_email || 'N/A',
          ownerEmail: org.owner_email || 'N/A',
          members: org.member_count || 0,
          plan: 'Standard', // Default plan - can be enhanced later
          planId: 'standard',
          credits: org.credit_balance || 0,
          creditsUsed: 0, // Will need to calculate from credit ledger
          createdAt: org.created_at ? new Date(org.created_at).toISOString().split('T')[0] : 'N/A',
          status: 'active',
        }));
        setOrganizations(transformed);
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error('Failed to fetch organizations:', error);
      setError('Failed to load organizations. Please try again.');
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await organizationAPI.create(formData);
      if (response.success) {
        setSuccess('Organization created successfully!');
        setShowCreateModal(false);
        setFormData({ name: '', owner_email: '', initial_credits: 0 });
        await fetchOrganizations();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.message || 'Failed to create organization');
    }
  };

  const handleEdit = (org) => {
    setSelectedOrg(org);
    setFormData({ name: org.name, owner_email: org.ownerEmail, initial_credits: org.credits });
    setShowEditModal(true);
    setError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const response = await organizationAPI.update(selectedOrg.id, { name: formData.name });
      if (response.success) {
        setSuccess('Organization updated successfully!');
        setShowEditModal(false);
        setSelectedOrg(null);
        setFormData({ name: '', owner_email: '', initial_credits: 0 });
        await fetchOrganizations();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.message || 'Failed to update organization');
    }
  };

  const handleDeleteClick = (org) => {
    setSelectedOrg(org);
    setShowDeleteModal(true);
    setError('');
  };

  const handleDelete = async () => {
    setError('');
    setSuccess('');
    
    try {
      await organizationAPI.delete(selectedOrg.id);
      setSuccess('Organization deleted successfully!');
      setShowDeleteModal(false);
      setSelectedOrg(null);
      await fetchOrganizations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to delete organization');
    }
  };

  const handleAddCredits = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const amount = parseInt(creditFormData.amount);
      if (!amount || amount <= 0) {
        setError('Please enter a valid amount greater than 0');
        return;
      }
      
      const response = await organizationAPI.addCredits(selectedOrg.id, amount, creditFormData.reason || 'Credit top-up by admin');
      if (response.success) {
        setSuccess(`Successfully added ${amount} credits! New balance: ${response.balance_after}`);
        setShowAddCreditsModal(false);
        setCreditFormData({ amount: '', reason: '' });
        await fetchOrganizations();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.message || 'Failed to add credits');
    }
  };

  const handleRemoveCredits = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const amount = parseInt(creditFormData.amount);
      if (!amount || amount <= 0) {
        setError('Please enter a valid amount greater than 0');
        return;
      }
      
      if (amount > selectedOrg.credits) {
        setError(`Cannot remove ${amount} credits. Organization only has ${selectedOrg.credits} credits.`);
        return;
      }
      
      const response = await organizationAPI.removeCredits(selectedOrg.id, amount, creditFormData.reason || 'Credit deduction by admin');
      if (response.success) {
        setSuccess(`Successfully removed ${amount} credits! New balance: ${response.balance_after}`);
        setShowRemoveCreditsModal(false);
        setCreditFormData({ amount: '', reason: '' });
        await fetchOrganizations();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (error) {
      setError(error.message || 'Failed to remove credits');
    }
  };

  const handleViewCredits = async (org) => {
    setSelectedOrg(org);
    setShowViewCreditsModal(true);
    setError('');
  };

  const handleOpenAddCredits = (org) => {
    setSelectedOrg(org);
    setCreditFormData({ amount: '', reason: '' });
    setShowAddCreditsModal(true);
    setError('');
  };

  const handleOpenRemoveCredits = (org) => {
    setSelectedOrg(org);
    setCreditFormData({ amount: '', reason: '' });
    setShowRemoveCreditsModal(true);
    setError('');
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlanColor = (plan) => {
    switch (plan.toLowerCase()) {
      case 'premium':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'standard':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'basic':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-gray-500 dark:text-gray-400">Loading organizations...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Organizations
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Manage and monitor all organizations on the platform
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
              <Download size={18} />
              Export
            </button>
            <button 
              onClick={() => {
                setShowCreateModal(true);
                setFormData({ name: '', owner_email: '', initial_credits: 0 });
                setError('');
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg text-sm font-medium"
            >
              <Plus size={18} />
              Add Organization
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, owner, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                <Filter size={18} />
                Filters
              </button>
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    viewMode === 'table'
                      ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Table
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Total Organizations</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">{organizations.length}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-900 dark:text-green-300">Total Members</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
              {filteredOrganizations.reduce((sum, org) => sum + org.members, 0)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
            <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Active Plans</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
              {filteredOrganizations.filter(org => org.status === 'active').length}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <p className="text-sm font-medium text-orange-900 dark:text-orange-300">Total Credits</p>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
              {filteredOrganizations.reduce((sum, org) => sum + org.credits, 0).toLocaleString()}
            </p>
          </div>
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

        {/* Organizations Display */}
        {organizations.length === 0 && !loading ? (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
            <Building2 className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Organizations Found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first organization</p>
            <button
              onClick={() => {
                setShowCreateModal(true);
                setFormData({ name: '', owner_email: '', initial_credits: 0 });
                setError('');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
            >
              <Plus size={18} />
              Create Organization
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => {
              const creditsPercent = org.credits > 0 ? ((org.creditsUsed / org.credits) * 100).toFixed(0) : 0;
              return (
                <div
                  key={org.id}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                        <Building2 className="text-white" size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg truncate">
                          {org.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {org.ownerEmail}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                      <MoreVertical className="text-gray-400" size={18} />
                    </button>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Users size={16} />
                        <span>{org.members} members</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPlanColor(org.plan)}`}>
                        {org.plan}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                        <span>Credits Usage</span>
                        <span className="font-medium">{creditsPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            creditsPercent > 90 ? 'bg-red-500' : creditsPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(creditsPercent, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>{org.creditsUsed.toLocaleString()} / {org.credits.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Calendar size={14} />
                      <span>Created: {org.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/dashboard/organization/${org.id}`)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Eye size={16} />
                        View
                      </button>
                      <button 
                        onClick={() => handleEdit(org)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(org)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewCredits(org)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Coins size={16} />
                        Credits
                      </button>
                      <button
                        onClick={() => handleOpenAddCredits(org)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium transition-colors"
                      >
                        <PlusCircle size={16} />
                        Add
                      </button>
                      <button
                        onClick={() => handleOpenRemoveCredits(org)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium transition-colors"
                      >
                        <MinusCircle size={16} />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Organization</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Owner</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Members</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Credits</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredOrganizations.map((org) => {
                    const creditsPercent = org.credits > 0 ? ((org.creditsUsed / org.credits) * 100).toFixed(0) : 0;
                    return (
                      <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                              <Building2 className="text-blue-600 dark:text-blue-400" size={18} />
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">{org.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">{org.ownerEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{org.owner}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Users size={16} className="text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">{org.members}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPlanColor(org.plan)}`}>
                            {org.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  creditsPercent > 90 ? 'bg-red-500' : creditsPercent > 70 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(creditsPercent, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-right">{creditsPercent}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">{org.createdAt}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/dashboard/organization/${org.id}`)}
                              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="text-blue-600 dark:text-blue-400" size={16} />
                            </button>
                            <button 
                              onClick={() => handleEdit(org)}
                              className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="text-blue-600 dark:text-blue-400" size={16} />
                            </button>
                            <button
                              onClick={() => handleViewCredits(org)}
                              className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                              title="View Credits"
                            >
                              <Coins className="text-purple-600 dark:text-purple-400" size={16} />
                            </button>
                            <button
                              onClick={() => handleOpenAddCredits(org)}
                              className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Add Credits"
                            >
                              <PlusCircle className="text-green-600 dark:text-green-400" size={16} />
                            </button>
                            <button
                              onClick={() => handleOpenRemoveCredits(org)}
                              className="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                              title="Remove Credits"
                            >
                              <MinusCircle className="text-orange-600 dark:text-orange-400" size={16} />
                            </button>
                            <button 
                              onClick={() => handleDeleteClick(org)}
                              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="text-red-600 dark:text-red-400" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Create Organization Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Organization</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', owner_email: '', initial_credits: 0 });
                    setError('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter organization name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Owner Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.owner_email}
                    onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="owner@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Initial Credits
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.initial_credits}
                    onChange={(e) => setFormData({ ...formData, initial_credits: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setFormData({ name: '', owner_email: '', initial_credits: 0 });
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Organization Modal */}
        {showEditModal && selectedOrg && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Organization</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedOrg(null);
                    setFormData({ name: '', owner_email: '', initial_credits: 0 });
                    setError('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter organization name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Owner Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={formData.owner_email}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Owner email cannot be changed</p>
                </div>
                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedOrg(null);
                      setFormData({ name: '', owner_email: '', initial_credits: 0 });
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedOrg && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Delete Organization</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedOrg(null);
                    setError('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Are you sure you want to delete <strong>{selectedOrg.name}</strong>? This action cannot be undone.
                </p>
                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm mb-4">{error}</div>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedOrg(null);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Credits Modal */}
        {showAddCreditsModal && selectedOrg && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Credits</h2>
                <button
                  onClick={() => {
                    setShowAddCreditsModal(false);
                    setCreditFormData({ amount: '', reason: '' });
                    setError('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Organization: <strong className="text-gray-900 dark:text-white">{selectedOrg.name}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current Balance: <strong className="text-green-600 dark:text-green-400">{selectedOrg.credits.toLocaleString()} credits</strong>
                </p>
              </div>
              <form onSubmit={handleAddCredits} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount to Add *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={creditFormData.amount}
                    onChange={(e) => setCreditFormData({ ...creditFormData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={creditFormData.reason}
                    onChange={(e) => setCreditFormData({ ...creditFormData, reason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Credit top-up by admin"
                  />
                </div>
                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCreditsModal(false);
                      setCreditFormData({ amount: '', reason: '' });
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-2"
                  >
                    <PlusCircle size={18} />
                    Add Credits
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Remove Credits Modal */}
        {showRemoveCreditsModal && selectedOrg && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Remove Credits</h2>
                <button
                  onClick={() => {
                    setShowRemoveCreditsModal(false);
                    setCreditFormData({ amount: '', reason: '' });
                    setError('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Organization: <strong className="text-gray-900 dark:text-white">{selectedOrg.name}</strong>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current Balance: <strong className="text-orange-600 dark:text-orange-400">{selectedOrg.credits.toLocaleString()} credits</strong>
                </p>
              </div>
              <form onSubmit={handleRemoveCredits} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount to Remove *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={selectedOrg.credits}
                    value={creditFormData.amount}
                    onChange={(e) => setCreditFormData({ ...creditFormData, amount: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter amount"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Maximum: {selectedOrg.credits.toLocaleString()} credits
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={creditFormData.reason}
                    onChange={(e) => setCreditFormData({ ...creditFormData, reason: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Credit deduction by admin"
                  />
                </div>
                {error && (
                  <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
                )}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowRemoveCreditsModal(false);
                      setCreditFormData({ amount: '', reason: '' });
                      setError('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all flex items-center justify-center gap-2"
                  >
                    <MinusCircle size={18} />
                    Remove Credits
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Credits Modal */}
        {showViewCreditsModal && selectedOrg && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Credit Information</h2>
                <button
                  onClick={() => {
                    setShowViewCreditsModal(false);
                    setError('');
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-purple-500 rounded-lg">
                      <Coins className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-300">Organization</p>
                      <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{selectedOrg.name}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-900 dark:text-purple-300">Current Balance:</span>
                      <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                        {selectedOrg.credits.toLocaleString()} credits
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-purple-900 dark:text-purple-300">Credits Used:</span>
                      <span className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                        {selectedOrg.creditsUsed.toLocaleString()} credits
                      </span>
                    </div>
                    {selectedOrg.credits > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-purple-900 dark:text-purple-300 mb-1">
                          <span>Usage</span>
                          <span>{((selectedOrg.creditsUsed / selectedOrg.credits) * 100).toFixed(0)}%</span>
                        </div>
                        <div className="w-full bg-purple-200 dark:bg-purple-800 rounded-full h-2">
                          <div
                            className="bg-purple-600 dark:bg-purple-400 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min((selectedOrg.creditsUsed / selectedOrg.credits) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowViewCreditsModal(false);
                      handleOpenAddCredits(selectedOrg);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    <PlusCircle size={16} />
                    Add Credits
                  </button>
                  <button
                    onClick={() => {
                      setShowViewCreditsModal(false);
                      handleOpenRemoveCredits(selectedOrg);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    <MinusCircle size={16} />
                    Remove Credits
                  </button>
                </div>
                <button
                  onClick={() => {
                    setShowViewCreditsModal(false);
                    setError('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

