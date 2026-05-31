import React from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import MetricsGrid from '../../components/dashboard/MetricsGrid';
import PropertyTable from '../../components/dashboard/PropertyTable';
import ActivityFeed from '../../components/dashboard/ActivityFeed';

export default function AdminDashboardPage() {
  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back. Here's what's happening with your properties today.</p>
      </div>

      <MetricsGrid />

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <PropertyTable />
        <ActivityFeed />
      </div>
    </AdminLayout>
  );
}
