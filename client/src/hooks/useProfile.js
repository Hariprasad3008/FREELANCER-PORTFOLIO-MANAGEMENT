import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const useProfile = (id) => {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await api.get(`/profiles/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useProfileMutations = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  const updateProfile = useMutation({
    mutationFn: async (profileData) => {
      const res = await api.put('/profiles/me', profileData);
      return res.data;
    },
    onSuccess: (data) => {
      if (data.user) {
        updateUser(data.user);
        queryClient.invalidateQueries({ queryKey: ['profile', data.user.id] });
      }
      queryClient.invalidateQueries({ queryKey: ['freelancers'] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });

  const addPortfolioItem = useMutation({
    mutationFn: async (itemData) => {
      const res = await api.post('/portfolio', itemData);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const deletePortfolioItem = useMutation({
    mutationFn: async (itemId) => {
      const res = await api.delete(`/portfolio/${itemId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const addReview = useMutation({
    mutationFn: async (reviewData) => {
      const res = await api.post('/reviews', reviewData);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['profile', variables.freelancer_id] });
      queryClient.invalidateQueries({ queryKey: ['freelancers'] });
    },
  });

  return {
    updateProfile,
    addPortfolioItem,
    deletePortfolioItem,
    addReview,
  };
};
