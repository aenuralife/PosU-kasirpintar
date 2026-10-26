import { create } from 'zustand'

export const useUIStore = create((set) => ({
  activeMenu: 'sales',
  searchQuery: '',
  setActiveMenu: (activeMenu) => set({ activeMenu }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}))
