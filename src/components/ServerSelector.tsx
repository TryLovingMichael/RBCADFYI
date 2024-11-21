import React from 'react';
import { useServerStore } from '../store/serverStore';

export function ServerSelector() {
  const { selectedTier, selectedServer, setServer } = useServerStore();

  const tiers = [1, 2, 3];
  const servers = Array.from({ length: 10 }, (_, i) => i + 1);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300">Tier</label>
        <select
          value={selectedTier}
          onChange={(e) => setServer(Number(e.target.value) as 1 | 2 | 3, selectedServer)}
          className="mt-1 block w-full rounded-md bg-dark-700 border-dark-600 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {tiers.map((tier) => (
            <option key={tier} value={tier}>
              Tier {tier}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300">Server</label>
        <select
          value={selectedServer}
          onChange={(e) => setServer(selectedTier, Number(e.target.value))}
          className="mt-1 block w-full rounded-md bg-dark-700 border-dark-600 text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {servers.map((server) => (
            <option key={server} value={server}>
              Server {server}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}