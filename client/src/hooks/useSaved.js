import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const useSavedIds = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['saved-ids'],
    queryFn: async () => {
      const res = await api.get('/saved/ids');
      return res.data;
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
};

export const useSavedProfiles = () => {
  const { isAuthenticated, isClient } = useAuth();

  return useQuery({
    queryKey: ['saved-profiles'],
    queryFn: async () => {
      const res = await api.get('/saved/profiles');
      return res.data;
    },
    enabled: isAuthenticated,
  });
};

export const useSavedProjects = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ['saved-projects'],
    queryFn: async () => {
      const res = await api.get('/saved/projects');
      return res.data;
    },
    enabled: isAuthenticated,
  });
};

export const useSavedMutations = () => {
  const queryClient = useQueryClient();

  const toggleSavedProfile = useMutation({
    mutationFn: async (freelancer_id) => {
      const res = await api.post('/saved/profiles', { freelancer_id });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-ids'] });
      queryClient.invalidateQueries({ queryKey: ['saved-profiles'] });
    },
  });

  const toggleSavedProject = useMutation({
    mutationFn: async (project_id) => {
      const res = await api.post('/saved/projects', { project_id });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-ids'] });
      queryClient.invalidateQueries({ queryKey: ['saved-projects'] });
    },
  });

  return {
    toggleSavedProfile,
    toggleSavedProject,
  };
};
