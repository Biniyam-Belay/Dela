import React from 'react';
import { FiDollarSign, FiAlertTriangle } from 'react-icons/fi';
import { formatETB } from '../../utils/utils';

const mockFinanceData = {
  totalRevenue: 128450,
  totalPayouts: 102300,
  pendingPayouts: 16200,
  totalOrders: 3879,
  refunds: 3200,
  expenses: 18500,
  netProfit: 106750,
  lastPayoutDate: '2025-04-28',
  nextPayoutDate: '2025-05-10',
};

const FinanceStat = ({ label, value, icon: Icon, color }) => (
  <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border border-slate-200">
    <div className={`mb-2 p-3 rounded-full ${color || 'bg-slate-100'}`}>{Icon && <Icon className="h-6 w-6" />}</div>
    <span className="text-xs text-slate-500 mb-1">{label}</span>
    <span className="text-2xl font-bold text-slate-900">{value}</span>
  </div>
);

const FinancePage = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Finance</h1>
          <p className="text-slate-500 mt-1 text-sm">Overview of your store's financial performance</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <FinanceStat label="Total Revenue" value={formatETB(mockFinanceData.totalRevenue)} icon={FiDollarSign} color="bg-emerald-50 text-emerald-600" />
        <FinanceStat label="Total Payouts" value={formatETB(mockFinanceData.totalPayouts)} icon={FiDollarSign} color="bg-violet-50 text-violet-600" />
        <FinanceStat label="Pending Payouts" value={formatETB(mockFinanceData.pendingPayouts)} icon={FiAlertTriangle} color="bg-amber-50 text-amber-600" />
        <FinanceStat label="Net Profit" value={formatETB(mockFinanceData.netProfit)} icon={FiDollarSign} color="bg-sky-50 text-sky-600" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">Recent Payouts</h2>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>Last Payout: <span className="font-medium">{mockFinanceData.lastPayoutDate}</span></li>
            <li>Next Scheduled Payout: <span className="font-medium">{mockFinanceData.nextPayoutDate}</span></li>
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">Other Financials</h2>
          <ul className="text-sm text-slate-700 space-y-2">
            <li>Total Orders: <span className="font-medium">{mockFinanceData.totalOrders}</span></li>
            <li>Refunds: <span className="font-medium">{formatETB(mockFinanceData.refunds)}</span></li>
            <li>Expenses: <span className="font-medium">{formatETB(mockFinanceData.expenses)}</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FinancePage;
