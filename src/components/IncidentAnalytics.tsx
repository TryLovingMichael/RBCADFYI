import React from 'react';
import { BarChart2, Clock, MapPin, AlertTriangle } from 'lucide-react';
import type { Incident } from '../types';

interface IncidentAnalyticsProps {
  incidents: Incident[];
}

export default function IncidentAnalytics({ incidents }: IncidentAnalyticsProps) {
  const today = new Date();
  const todayIncidents = incidents.filter(i => 
    i.timestamp?.toDate().toDateString() === today.toDateString()
  );

  const calculateStats = () => {
    const total = todayIncidents.length;
    const resolved = todayIncidents.filter(i => i.status === 'resolved').length;
    const avgResponseTime = todayIncidents.reduce((acc, i) => {
      if (i.status === 'resolved') {
        const start = i.timestamp?.toMillis() ?? 0;
        const end = i.updatedAt?.toMillis() ?? 0;
        return acc + (end - start);
      }
      return acc;
    }, 0) / (resolved || 1);

    const priorityCount = {
      high: todayIncidents.filter(i => i.priority === 'high').length,
      medium: todayIncidents.filter(i => i.priority === 'medium').length,
      low: todayIncidents.filter(i => i.priority === 'low').length
    };

    return { total, resolved, avgResponseTime, priorityCount };
  };

  const stats = calculateStats();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-blue-600" />
          Today's Analytics
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Incidents</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Resolved</p>
              <p className="text-2xl font-bold">{stats.resolved}</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Avg Response</p>
              <p className="text-2xl font-bold">
                {Math.round(stats.avgResponseTime / 60000)}m
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">High Priority</p>
              <p className="text-2xl font-bold">{stats.priorityCount.high}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Priority Distribution</h3>
        <div className="h-4 rounded-full overflow-hidden bg-gray-200">
          <div className="flex h-full">
            <div 
              className="bg-red-500" 
              style={{ width: `${(stats.priorityCount.high / stats.total) * 100}%` }}
            />
            <div 
              className="bg-yellow-500" 
              style={{ width: `${(stats.priorityCount.medium / stats.total) * 100}%` }}
            />
            <div 
              className="bg-green-500" 
              style={{ width: `${(stats.priorityCount.low / stats.total) * 100}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between text-xs mt-1">
          <span>High: {stats.priorityCount.high}</span>
          <span>Medium: {stats.priorityCount.medium}</span>
          <span>Low: {stats.priorityCount.low}</span>
        </div>
      </div>
    </div>
  );
}