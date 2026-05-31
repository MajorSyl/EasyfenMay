import React from 'react';
import { MOCK_ACTIVITIES } from '../../lib/adminMockData';

export default function ActivityFeed() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 w-full lg:w-96 shrink-0">
      <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Activity</h2>
      
      <div className="space-y-6">
        {MOCK_ACTIVITIES.map((activity, index) => (
          <div key={activity.id} className="relative pl-6">
            {/* Timeline Line */}
            {index !== MOCK_ACTIVITIES.length - 1 && (
              <div className="absolute left-[9px] top-6 bottom-[-24px] w-px bg-slate-200"></div>
            )}
            
            {/* Timeline Dot */}
            <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-white shadow-sm ${
              activity.type === 'booking' ? 'bg-emerald-500' :
              activity.type === 'checkout' ? 'bg-slate-400' :
              activity.type === 'payment' ? 'bg-sky-500' :
              'bg-amber-500'
            }`}></div>
            
            {/* Content */}
            <div>
              <p className="text-sm font-medium text-slate-900 leading-snug">{activity.message}</p>
              <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
