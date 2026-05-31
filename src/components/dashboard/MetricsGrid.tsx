import React from 'react';
import { MOCK_METRICS } from '../../lib/adminMockData';

export default function MetricsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {/* Revenue Card */}
      <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm font-semibold text-slate-500 mb-2">Total Revenue</p>
        <div className="flex items-end justify-between">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900">${MOCK_METRICS.revenue.toLocaleString()}</h3>
          <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            {MOCK_METRICS.revenueGrowth}
          </span>
        </div>
      </div>

      {/* Bookings Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm font-semibold text-slate-500 mb-2">Total Bookings</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-bold text-slate-900">{MOCK_METRICS.bookings}</h3>
          <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            {MOCK_METRICS.bookingsGrowth}
          </span>
        </div>
      </div>

      {/* Active Listings Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm font-semibold text-slate-500 mb-2">Active Listings</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-bold text-slate-900">{MOCK_METRICS.activeListings}</h3>
        </div>
      </div>

      {/* Occupancy Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm font-semibold text-slate-500 mb-2">Occupancy Rate</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-bold text-slate-900">{MOCK_METRICS.occupancyRate}</h3>
          <span className="text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            {MOCK_METRICS.occupancyGrowth}
          </span>
        </div>
      </div>
    </div>
  );
}
