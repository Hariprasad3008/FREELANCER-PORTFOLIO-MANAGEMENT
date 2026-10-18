import { useQuery } from '@tanstack/react-query';
import api from '../services/api.js';

export const useTalent = (filters = {}) => {
  return useQuery({
    queryKey: ['freelancers', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.experience && filters.experience !== 'All') params.append('experience', filters.experience);
      if (filters.availability && filters.availability !== 'All') params.append('availability', filters.availability);
      if (filters.minRate) params.append('minRate', filters.minRate);
      if (filters.maxRate) params.append('maxRate', filters.maxRate);
      if (filters.sort) params.append('sort', filters.sort);

      const res = await api.get(`/profiles/freelancers?${params.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 3, // 3 mins cache
  });
};

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get('/profiles/clients');
      return res.data;
    },
    staleTime: 1000 * 60 * 3,
  });
};
