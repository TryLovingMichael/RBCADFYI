import { create } from 'zustand';

interface ServerState {
  selectedTier: 1 | 2 | 3;
  selectedServer: number;
  getServerId: () => string;
  setServer: (tier: 1 | 2 | 3, server: number) => void;
}

export const useServerStore = create<ServerState>((set, get) => ({
  selectedTier: 1,
  selectedServer: 1,

  getServerId: () => {
    const { selectedTier, selectedServer } = get();
    return `T${selectedTier}S${selectedServer}`;
  },

  setServer: (tier: 1 | 2 | 3, server: number) => {
    set({ selectedTier: tier, selectedServer: server });
  }
}));