import { create } from 'zustand';

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
  openSidebar: () => set({ isSidebarOpen: true }),
}));

interface SearchState {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: {
    category: string | null;
    difficulty: string | null;
    maxTime: number | null; // minutes
  };
  setFilter: (key: keyof SearchState['filters'], value: any) => void;
  resetFilters: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  filters: {
    category: null,
    difficulty: null,
    maxTime: null,
  },
  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),
  resetFilters: () =>
    set({
      filters: {
        category: null,
        difficulty: null,
        maxTime: null,
      },
    }),
}));
