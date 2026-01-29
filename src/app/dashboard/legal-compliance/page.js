'use client';

import { Scale, Save, FileText, Shield, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { legalAPI } from '@/lib/api';



export default function LegalCompliancePage() {
  const [activeTab, setActiveTab] = useState('terms');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [content, setContent] = useState({
    terms: { title: '', content: '', version: '1.0' },
    privacy: { title: '', content: '', version: '1.0' },
    gdpr: { title: '', content: '', version: '1.0' }
  });

  useEffect(() => {
    fetchLegalContent();
  }, []);

  const fetchLegalContent = async () => {
    try {
      setLoading(true);
      const response = await legalAPI.getAll();
      if (response.success && response.content) {
        // Update content state with fetched data
        const updatedContent = { ...content };
        ['terms', 'privacy', 'gdpr'].forEach(type => {
          if (response.content[type]) {
            updatedContent[type] = {
              title: response.content[type].title || '',
              content: response.content[type].content || '',
              version: response.content[type].version || '1.0'
            };
          }
        });
        setContent(updatedContent);
      }
    } catch (error) {
      console.error('Failed to fetch legal content:', error);
      setMessage({ type: 'error', text: 'Failed to load legal content. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (contentType) => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const data = {
        title: content[contentType].title,
        content: content[contentType].content,
        version: content[contentType].version
      };

      const response = await legalAPI.update(contentType, data);
      
      if (response.success) {
        setMessage({ type: 'success', text: `${contentType.charAt(0).toUpperCase() + contentType.slice(1)} updated successfully!` });
        // Update version if returned
        if (response.version) {
          setContent(prev => ({
            ...prev,
            [contentType]: { ...prev[contentType], version: response.version }
          }));
        }
      } else {
        setMessage({ type: 'error', text: response.error || 'Failed to update content' });
      }
    } catch (error) {
      console.error('Failed to save legal content:', error);
      setMessage({ type: 'error', text: error.message || 'Failed to save. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleContentChange = (contentType, field, value) => {
    setContent(prev => ({
      ...prev,
      [contentType]: {
        ...prev[contentType],
        [field]: value
      }
    }));
  };

  const tabs = [
    { id: 'terms', label: 'Terms and Conditions', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', icon: Shield },
    { id: 'gdpr', label: 'GDPR Compliance', icon: CheckCircle }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading legal content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Scale className="text-blue-600 dark:text-blue-400" size={32} />
          Legal and Compliance
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage terms and conditions, privacy policy, and GDPR compliance documents
        </p>
      </div>

      {/* Message Display */}
      {message.text && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${
                      activeTab === tab.id
                        ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }
                  `}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {tabs.map((tab) => {
            if (activeTab !== tab.id) return null;
            
            return (
              <div key={tab.id} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={content[tab.id].title}
                    onChange={(e) => handleContentChange(tab.id, 'title', e.target.value)}
                    placeholder={`Enter ${tab.label} title`}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    value={content[tab.id].version}
                    onChange={(e) => handleContentChange(tab.id, 'version', e.target.value)}
                    placeholder="e.g., 1.0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Content
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    You can use HTML formatting for rich text content
                  </p>
                  <textarea
                    value={content[tab.id].content}
                    onChange={(e) => handleContentChange(tab.id, 'content', e.target.value)}
                    placeholder={`Enter ${tab.label} content here...`}
                    rows={20}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleSave(tab.id)}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={20} />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
