import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';

export const useProjects = (filters = {}) => {
  return useQuery({
    queryKey: ['projects', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category && filters.category !== 'All') params.append('category', filters.category);
      if (filters.budgetType && filters.budgetType !== 'All') params.append('budgetType', filters.budgetType);
      if (filters.status && filters.status !== 'All') params.append('status', filters.status);
      if (filters.minBudget) params.append('minBudget', filters.minBudget);
      if (filters.maxBudget) params.append('maxBudget', filters.maxBudget);
      if (filters.sort) params.append('sort', filters.sort);
      if (filters.clientId) params.append('clientId', filters.clientId);

      const res = await api.get(`/projects?${params.toString()}`);
      return res.data;
    },
    staleTime: 1000 * 60 * 3,
  });
};

export const useProjectDetails = (projectId) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const res = await api.get(`/projects/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
  });
};

export const useMyProjects = () => {
  return useQuery({
    queryKey: ['my-projects'],
    queryFn: async () => {
      const res = await api.get('/projects/my/projects');
      return res.data;
    },
  });
};

export const useProjectMutations = () => {
  const queryClient = useQueryClient();

  const createProject = useMutation({
    mutationFn: async (projectData) => {
      const res = await api.post('/projects', projectData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
    },
  });

  const updateProject = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await api.put(`/projects/${id}`, data);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/projects/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
    },
  });

  return {
    createProject,
    updateProject,
    deleteProject,
  };
};
