import { useState, useMemo } from 'react';

export type ContentSortBy = 'newest' | 'oldest' | 'most_liked' | 'most_viewed' | 'trending';
export type ContentCategory = 'all' | 'personal' | 'community' | 'education' | 'advocacy' | 'art' | 'music';

export interface ContentFilters {
  search: string;
  category: ContentCategory;
  sortBy: ContentSortBy;
  dateRange: 'all' | 'today' | 'week' | 'month' | 'year';
}

export const useContentFilters = () => {
  const [filters, setFilters] = useState<ContentFilters>({
    search: '',
    category: 'all',
    sortBy: 'newest',
    dateRange: 'all',
  });

  const updateFilter = <K extends keyof ContentFilters>(
    key: K,
    value: ContentFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      sortBy: 'newest',
      dateRange: 'all',
    });
  };

  return {
    filters,
    updateFilter,
    resetFilters,
  };
};
