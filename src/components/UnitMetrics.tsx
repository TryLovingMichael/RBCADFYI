import React from 'react';
import { Clock, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import type { Unit, Incident } from '../types';

interface UnitMetricsProps {
  units: Unit[];
  incidents: Incident[];
}

export default function UnitMetrics({ units, incidents }: UnitMetricsProps) {
  const calculateUnitMetrics = (unit: Unit) => {
    const unitIncidents = incidents.filter(i => i.assignedUnits?.includes(unit.unitNumber));
    const resolvedIncidents = unitIncidents.filter(i => i.status === 'resolved');
    const responseTime = unitIncidents.reduce((acc, i) => {
      const assignTime = i.timestamp?.toMillis() ?? 0;
      const resolveTime = i.updatedAt?.toMillis() ?? 0;
      return acc + (resolveTime - assignTime);
    }, 0) / (unitIncidents.length || 1);

    return {
      totalCalls: unitIncidents.length,
      resolvedCalls: resolvedIncidents.length,
      avgResponseTime: responseTime / 60000, // Convert to minutes
      priority: {
        high: unitIncidents.filter(i => i.priority === 'high').length,
        medium: unitIncidents.filter(i => i.priority === 'medium').length,
        low: unitIncidents.filter(i => i.priority === 'low').length,
      }
    };
  };

  return (
    <div className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {units.map(unit => {
          const metrics = calculateUnitMetrics(unit);
          
          return (
            <div key={unit.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-semibold">Unit {unit.unitNumber}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  unit.status === 'available' ? 'bg-green-100 text-green-800' :
                  unit.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {unit.status.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Activity className="h-4 w-4 text-blue-600 mr-2" />
                  <div>
                    <div className="text-sm font-medium">Total Calls</div>
                    <div className="text-2xl font-bold">{metrics.totalCalls}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <div>
                    <div className="text-sm font-medium">Resolved</div>
                    <div className="text-2xl font-bold">{metrics.resolvedCalls}</div>
                  </div>
                </div>

                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-yellow-600 mr-2" />
                  <div>
                    <div className="text-sm font-medium">Avg Response</div>
                    <div className="text-2xl font-bold">
                      {Math.round(metrics.avgResponseTime)}m
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                  <div>
                    <div className="text-sm font-medium">High Priority</div>
                    <div className="text-2xl font-bold">{metrics.priority.high}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Call Distribution</div>
                <div className="flex h-4 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-500" 
                    style={{ width: `${(metrics.priority.high / metrics.totalCalls) * 100}%` }}
                  />
                  <div 
                    className="bg-yellow-500" 
                    style={{ width: `${(metrics.priority.medium / metrics.totalCalls) * 100}%` }}
                  />
                  <div 
                    className="bg-green-500" 
                    style={{ width: `${(metrics.priority.low / metrics.totalCalls) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span>High: {metrics.priority.high}</span>
                  <span>Medium: {metrics.priority.medium}</span>
                  <span>Low: {metrics.priority.low}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}