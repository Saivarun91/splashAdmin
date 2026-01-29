'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, CheckCircle, XCircle, Clock, Loader2, Eye, FileText, Settings } from 'lucide-react';
import { paymentAPI } from '@/lib/api';
import { InvoiceView } from '@/components/InvoiceView';
import { InvoiceTemplateEditor } from '@/components/InvoiceTemplateEditor';
import { Button } from '@/components/ui/button';

export default function PaymentHistoryPage() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await paymentAPI.getAll();
      if (response.success && response.transactions) {
        // Transform API data to match component format
        const transformed = response.transactions.map((txn) => ({
          id: txn.id,
          organization: txn.is_single_user 
            ? (txn.user_name || txn.user_email || 'Individual User')
            : (txn.organization_name || 'Unknown Organization'),
          organizationId: txn.organization_id || null,
          userId: txn.user_id || null,
          userEmail: txn.user_email || null,
          userName: txn.user_name || null,
          isSingleUser: txn.is_single_user || false,
          amount: txn.amount,
          status: txn.status === 'completed' ? 'Completed' : 
                  txn.status === 'pending' ? 'Pending' : 
                  txn.status === 'failed' ? 'Failed' : 'Unknown',
          date: txn.created_at ? new Date(txn.created_at).toISOString().split('T')[0] : 'N/A',
          transactionId: txn.razorpay_order_id || txn.razorpay_payment_id || 'N/A',
          plan: txn.plan_name || 'Credit Purchase',
          credits: txn.credits,
          currency: txn.currency || 'INR',
        }));
        setPayments(transformed);
      } else {
        setPayments([]);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      setError('Failed to load payment history. Please try again.');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'Pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'Failed':
        return <XCircle className="text-red-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300';
      case 'Pending':
        return 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300';
      case 'Failed':
        return 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300';
      default:
        return '';
    }
  };

  const totalRevenue = payments
    .filter((p) => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-500 dark:text-gray-400">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Payment History
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              View all payment transactions
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push('/dashboard/invoice-settings')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Settings className="w-4 h-4" />
              Invoice Settings
            </Button>
            <Button
              onClick={() => setShowTemplateEditor(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Edit Template
            </Button>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="text-green-500" size={24} />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₹{totalRevenue.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Organization / User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Transaction ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {payment.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          {payment.isSingleUser && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300">
                              Individual
                            </span>
                          )}
                          <span>{payment.organization}</span>
                          {payment.userEmail && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ({payment.userEmail})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {payment.plan}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        ₹{payment.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {payment.credits.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                              payment.status
                            )}`}
                          >
                            {payment.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400 font-mono">
                        {payment.transactionId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          onClick={() => setSelectedInvoice({
                            transactionId: payment.transactionId,
                            paymentData: {
                              ...payment,
                              is_single_user: payment.isSingleUser,
                              user_name: payment.userName,
                              user_email: payment.userEmail,
                              organization_name: payment.organization
                            }
                          })}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4"  />
                          View Invoice
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">No payment transactions found</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Invoice View Modal */}
      {selectedInvoice && (
        <InvoiceView
          transactionId={selectedInvoice.transactionId}
          paymentData={selectedInvoice.paymentData}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
      
      {/* Invoice Template Editor Modal */}
      {showTemplateEditor && (
        <InvoiceTemplateEditor
          onClose={() => setShowTemplateEditor(false)}
        />
      )}
    </>
  );
}
