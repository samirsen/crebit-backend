import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, CheckCircle, AlertCircle, Loader, Clock, Download } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { getApiUrl } from '../config/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Transaction {
  id: string;
  unblockpay_transaction_id: string;
  type: string;
  status: string;
  amount_usd: number;
  amount_local?: number;
  local_currency?: string;
  recipient?: string;
  reference?: string;
  created_at: string;
  updated_at: string;
}

interface TransactionSummary {
  total_sent: number;
  total_completed: number;
  total_pending: number;
  transaction_count: number;
}

const Dashboard = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated (only after auth has loaded)
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  // Fetch user transactions on mount
  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl(`/api/user-transactions/${user.id}`));
        
        if (!response.ok) {
          throw new Error('Failed to fetch transactions');
        }
        
        const data = await response.json();
        setTransactions(data.transactions || []);
        setSummary(data.summary || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
    
    // Set up polling to refresh transactions every 10 seconds
    const interval = setInterval(fetchTransactions, 10000);
    
    return () => clearInterval(interval);
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'a few seconds ago';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return '1 day ago';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'processing':
        return <Loader className="w-3 h-3 mr-1 animate-spin" />;
      case 'pending':
      case 'awaiting_deposit':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'awaiting_deposit':
        return 'bg-purple-100 text-purple-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const generateReceipt = (transaction: Transaction) => {
    const receiptContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 2px solid #17484A;">
        <div style="text-align: center; margin-bottom: 30px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="46" height="61" viewBox="0 0 46 61" fill="none" style="display: inline-block; height: 48px; width: auto;">
            <path d="M0.00556087 50.9902C0.00556087 46.6772 15.4361 42.1411 17.2579 47.4734C18.1966 50.2214 14.9879 53.336 13.6258 53.9413C14.8365 53.8656 17.5303 53.8505 18.6199 54.3953C19.7096 54.9401 19.1929 55.7573 18.6199 55.7573C18.047 55.7573 14.7609 55.7573 14.7609 55.7573C15.8959 55.9843 18.6199 56.6654 20.436 57.5734C21.7924 58.5527 20.7331 58.8597 19.7494 58.9354C18.7657 59.0111 15.4148 57.4164 15.4148 57.4164C15.8457 57.5961 16.7226 58.0981 17.9389 59.1624C19.2954 60.3493 17.6225 60.8228 17.2579 60.5244C14.7609 58.4814 7.95072 57.1194 3.86464 55.3033C0.595843 53.8505 -0.0700808 51.8226 0.00556087 50.9902Z" fill="#0C3E3F"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M20.8847 20.9139C21.9441 16.6765 26.0151 9.51836 33.8239 14.7848C36.4724 13.2715 41.7236 12.1519 41.5421 18.8709L44.9471 20.9139C45.6281 21.2923 46.6721 22.594 45.4012 24.773C44.2262 26.7872 44.24 34.536 34.7825 42.5813C34.6353 42.7059 33.7068 45.9344 35.413 49.2456C35.7867 49.9706 41.5417 50.3807 40.8611 51.9696C40.4719 52.8776 36.0942 50.8788 36.094 51.7426C36.094 52.4236 38.5908 54.0126 37.91 54.9207C37.1452 55.9409 33.2421 51.6094 32.0079 51.7426C30.3615 51.9212 28.9616 53.7624 27.9218 52.8777C26.8343 51.9521 30.4833 49.4839 30.8631 49.2474C30.6989 49.223 30.1152 46.1942 29.9648 46.2945C28.3736 47.3838 27.7451 47.535 25.9085 48.4631C25.6518 48.5928 25.337 48.472 25.2379 48.202L25.1069 47.8446C25.0279 47.6293 25.1154 47.3875 25.3109 47.2678C34.0267 41.9318 38.5987 33.9036 40.5343 28.4489C41.1499 26.7141 39.5919 25.1624 37.8561 25.7754C28.5486 29.0624 24.6443 36.6631 23.8357 40.4363C23.079 43.5387 23.1093 51.8529 27.4678 54.3953H32.0079C32.4617 54.3953 33.6873 55.2126 32.2349 55.7573C30.419 56.4383 28.603 55.8289 28.3758 56.5097C28.1488 57.1908 29.2838 57.4178 30.8729 58.3258C32.4616 59.2337 30.6457 60.1417 28.6028 58.9354C28.3508 58.7866 26.3808 57.1793 25.6515 57.5734C25.2235 57.8047 25.8785 59.6877 25.4245 60.1417C25.1645 60.4017 24.5165 60.5244 24.2895 59.6877C23.9694 58.5079 23.4419 56.7042 22.7007 56.0557C21.5956 55.0889 21.6713 53.1598 20.8847 50.8785C20.8788 50.8577 19.9839 47.1841 17.5248 44.6067C15.0994 42.0645 8.54814 43.9395 6.14956 44.6067C5.77277 44.7115 5.4362 44.362 5.57769 43.9974C7.95065 37.8824 13.7964 25.7547 20.8847 20.9139ZM29.0568 17.919C27.0509 17.919 25.4248 19.5451 25.4248 21.551C25.4248 23.557 27.0509 25.1831 29.0568 25.1831C31.0627 25.183 32.6889 23.5569 32.6889 21.551C32.6889 19.5452 31.0626 17.9191 29.0568 17.919Z" fill="#0C3E3F"/>
            <path d="M31.3267 21.5511C31.3267 22.1888 31.0637 22.765 30.6404 23.1774C30.2314 23.5757 29.6726 23.8211 29.0566 23.8211C27.8029 23.8211 26.7045 23.0974 26.7045 21.5084C26.7045 20.7316 26.9429 20.197 27.4198 19.7201C27.9092 19.2307 28.4794 19.124 29.0888 19.124C29.8418 19.124 28.9306 20.3471 29.3272 20.9139C29.6213 21.3342 31.3267 21.0173 31.3267 21.5511Z" fill="#0C3E3F"/>
            <path d="M33.9167 13.4868C33.88 13.5077 33.834 13.505 33.7988 13.4816C27.4662 9.26672 22.4781 13.2776 21.0108 17.5239C20.9739 17.6308 20.8145 17.6255 20.7881 17.5155L18.4165 7.60318C18.2814 7.03889 18.7911 6.53157 19.3548 6.66923L23.6893 7.72783C23.7403 7.74029 23.793 7.71509 23.8153 7.66757L27.0053 0.881595C27.2174 0.43044 27.7939 0.293639 28.1861 0.60141L34.166 5.29434L37.7968 1.87753C38.2491 1.45193 38.9932 1.70395 39.0937 2.31677L40.9277 13.4934C40.9469 13.6106 40.7778 13.6812 40.6992 13.5922C38.9556 11.6184 35.7952 12.4186 33.9167 13.4868Z" fill="#0C3E3F"/>
          </svg>
          <h1 style="color: #0C3E3F; margin: 10px 0 0 0; font-size: 32px; font-weight: 650; letter-spacing: -2px;">Crebit</h1>
          <p style="color: #666; margin: 5px 0;">Payment Receipt</p>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #17484A; font-size: 18px; margin-top: 0;">Transaction Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Transaction ID:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">${transaction.unblockpay_transaction_id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Date:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">${formatDate(transaction.created_at)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Status:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; text-transform: capitalize;">${transaction.status}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #17484A; font-size: 18px; margin-top: 0;">Customer Information</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Name:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">${userProfile?.first_name} ${userProfile?.last_name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666;">Email:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">${userProfile?.email}</td>
            </tr>
          </table>
        </div>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #17484A; font-size: 18px; margin-top: 0;">Payment Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666;">Amount Sent (${transaction.local_currency}):</td>
              <td style="padding: 8px 0; text-align: right; font-size: 20px; font-weight: bold; color: #333;">${transaction.local_currency} ${transaction.amount_local?.toLocaleString()}</td>
            </tr>
            <tr style="border-top: 1px solid #ddd;">
              <td style="padding: 8px 0; padding-top: 12px; color: #666;">Amount Received (USD):</td>
              <td style="padding: 8px 0; padding-top: 12px; text-align: right; font-size: 24px; font-weight: bold; color: #17484A;">$${transaction.amount_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD</td>
            </tr>
          </table>
        </div>
        
        <div style="text-align: center; color: #666; font-size: 12px; margin-top: 30px;">
          <p>Thank you for using Crebit!</p>
          <p>For questions or support, please contact us at <strong>info@getcrebit.com</strong></p>
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Crebit Receipt - ${transaction.unblockpay_transaction_id}</title>
          </head>
          <body>
            ${receiptContent}
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <DashboardLayout activeTab="Dashboard">
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-[#17484A]" />
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout activeTab="Dashboard">
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin text-[#17484A]" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout activeTab="Dashboard">
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="Dashboard">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
          <p className="text-gray-600 mt-1">View all your payment transactions and their statuses</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Transacted</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(summary?.total_sent || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-[#17484A]" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(summary?.total_completed || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(summary?.total_pending || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <Loader className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">All Transactions</h3>
          </div>
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">No transactions yet</p>
              <button
                onClick={() => navigate('/get-started')}
                className="mt-4 bg-[#17484A] text-white px-6 py-2 rounded-md hover:bg-[#17484A]/90 transition-colors"
              >
                Make Your First Payment
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#17484A]/10">
                      <ArrowUpRight className="w-5 h-5 text-[#17484A]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        Transaction
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-sm text-gray-500">
                          {transaction.unblockpay_transaction_id.slice(0, 8)}...
                        </p>
                        <span className="text-gray-300">•</span>
                        <p className="text-sm text-gray-500">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex items-center space-x-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        ${transaction.amount_usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      {transaction.amount_local && transaction.local_currency && (
                        <p className="text-sm text-gray-500">
                          {transaction.amount_local.toLocaleString()} {transaction.local_currency === 'USDC' ? 'USD' : transaction.local_currency}
                        </p>
                      )}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                      {getStatusIcon(transaction.status)}
                      {transaction.status}
                    </span>
                    {(transaction.status === 'completed' || transaction.status === 'processing' || transaction.status === 'payout.completed') && (
                      <button
                        onClick={() => generateReceipt(transaction)}
                        className="flex items-center gap-2 px-3 py-2 bg-[#17484A] text-white rounded-md hover:bg-[#17484A]/90 transition-colors text-sm"
                        title="Download Receipt"
                      >
                        <Download className="w-4 h-4" />
                        Receipt
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
