import React from 'react';
import { FiDollarSign, FiAlertTriangle } from 'react-icons/fi';

const AdminFinancePage = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Finance</h1>
          <p className="text-slate-500 mt-1">Overview of financial data (Coming Soon)</p>
        </div>
        {/* Add actions like Export Reports if needed later */}
      </div>

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-12 text-center">
        <FiAlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-lg font-medium text-slate-700">Finance Module Under Construction</h2>
        <p className="text-sm text-slate-500 mt-2">
          This section will contain financial reports, transaction history, and payout information.
        </p>
        {/* You could add placeholder charts or stats here later */}
      </div>
    </div>
  );
};

export default AdminFinancePage;
