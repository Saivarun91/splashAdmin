'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, CheckCircle, XCircle, Clock, Loader2, User } from 'lucide-react';
import { OrganizationStats } from '@/components/organization/OrganizationStats';
import { ProjectsGrid } from '@/components/organization/ProjectsGrid';
import { ProjectDetailView } from '@/components/organization/ProjectDetailView';
import { GeneratedImagesGallery } from '@/components/organization/image-analysis/GeneratedImagesGallery';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { individualUserAPI, subscriptionAPI, paymentAPI } from '@/lib/api';
import { PlanCard } from '@/components/subscriptions/PlanCard';

export default function IndividualUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [collectionData, setCollectionData] = useState(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState('projects');
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userData = await individualUserAPI.getById(params.id);
        setUser({
          ...userData,
          name: userData.full_name || userData.username || userData.email,
          owner_email: userData.email,
          totalUsers: 1,
          growthRate: 0,
        });
      } catch (error) {
        console.error('Failed to fetch individual user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const response = await subscriptionAPI.getAll();
        if (response.success && response.plans) {
          setPlans(response.plans);
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setPlansLoading(false);
      }
    };

    const fetchPayments = async () => {
      setPaymentsLoading(true);
      try {
        const response = await paymentAPI.getAll({ user_id: params.id });
        if (response.success && response.transactions) {
          setPayments(response.transactions);
        }
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setPaymentsLoading(false);
      }
    };

    if (params.id) {
      fetchUserData();
      fetchPlans();
      fetchPayments();
    }
  }, [params.id]);

  useEffect(() => {
    if (!params.id || activeMainTab !== 'payments') return;
    const fetchPayments = async () => {
      setPaymentsLoading(true);
      try {
        const response = await paymentAPI.getAll({ user_id: params.id });
        if (response.success && response.transactions) {
          setPayments(response.transactions);
        }
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setPaymentsLoading(false);
      }
    };
    fetchPayments();
  }, [activeMainTab, params.id]);

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="text-gray-500 dark:text-gray-400">Loading user...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">Individual user not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-700 to-purple-800 px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/dashboard/users/individual')}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors backdrop-blur-sm"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-1">
                {user.full_name || user.username || user.email}
              </h1>
              <p className="text-purple-100 text-sm">Individual User Dashboard</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Email</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{user.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Credit Balance</p>
              <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-semibold">
                {user.credit_balance?.toLocaleString() || 0} credits
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Member Since</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <OrganizationStats organization={user} />

      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="w-full">
          <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-8">
            <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto border-b-0 gap-1">
              <TabsTrigger value="projects" className="rounded-t-lg border-b-2 border-transparent px-6 py-4 text-sm font-semibold data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                Projects
                {user.projects?.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                    {user.projects.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="images" className="rounded-t-lg border-b-2 border-transparent px-6 py-4 text-sm font-semibold data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                Generated Images
              </TabsTrigger>
              <TabsTrigger value="plans" className="rounded-t-lg border-b-2 border-transparent px-6 py-4 text-sm font-semibold data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                <CreditCard size={18} className="mr-2" />
                Plans
              </TabsTrigger>
              <TabsTrigger value="payments" className="rounded-t-lg border-b-2 border-transparent px-6 py-4 text-sm font-semibold data-[state=active]:border-purple-600 data-[state=active]:text-purple-600 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
                Payments
                {payments.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                    {payments.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="projects" className="m-0 p-8">
            <ProjectsGrid
              projects={user.projects || []}
              onSelectProject={handleProjectSelect}
              selectedProjectId={selectedProject?.id}
            />
          </TabsContent>

          <TabsContent value="images" className="m-0 p-8">
            <GeneratedImagesGallery userId={params.id} />
          </TabsContent>

          <TabsContent value="plans" className="m-0 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Available Plans</h2>
              <p className="text-gray-600 dark:text-gray-400">Subscription plans available for individual users</p>
            </div>
            {plansLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : plans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={{
                      id: plan.id,
                      name: plan.name,
                      description: plan.description,
                      price: plan.price,
                      originalPrice: plan.original_price,
                      currency: plan.currency || 'USD',
                      billingCycle: plan.billing_cycle,
                      credits_per_month: plan.credits_per_month,
                      max_projects: plan.max_projects,
                      ai_features_enabled: plan.ai_features_enabled,
                      features: plan.features || [],
                      isActive: plan.is_active,
                      isPopular: plan.is_popular,
                    }}
                    isActive={plan.is_active}
                    isPopular={plan.is_popular}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">No plans available</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="payments" className="m-0 p-8">
            {paymentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
              </div>
            ) : payments.length > 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Plan</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Credits</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {payments.map((payment) => {
                        const status = payment.status || 'pending';
                        const statusIcon = status === 'completed'
                          ? <CheckCircle className="text-green-500" size={18} />
                          : status === 'failed'
                            ? <XCircle className="text-red-500" size={18} />
                            : <Clock className="text-yellow-500" size={18} />;
                        return (
                          <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {payment.plan_name || 'Credit Purchase'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                              ₹{payment.amount?.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                              {payment.credits?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {statusIcon}
                                <span className="text-sm capitalize">{status}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">
                              {payment.razorpay_order_id || payment.razorpay_payment_id || 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No payment transactions found for this user</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {showProjectDetail && selectedProject && (
        <ProjectDetailView
          project={selectedProject}
          collectionData={collectionData}
          onClose={() => {
            setShowProjectDetail(false);
            setSelectedProject(null);
            setCollectionData(null);
          }}
        />
      )}
    </div>
  );
}
