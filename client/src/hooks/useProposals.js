import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';

export const useProjectProposals = (projectId) => {
  return useQuery({
    queryKey: ['proposals', 'project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const res = await api.get(`/proposals/project/${projectId}`);
      return res.data;
    },
    enabled: !!projectId,
  });
};

export const useMyProposals = () => {
  return useQuery({
    queryKey: ['proposals', 'my'],
    queryFn: async () => {
      const res = await api.get('/proposals/my');
      return res.data;
    },
  });
};

export const useProposalMutations = () => {
  const queryClient = useQueryClient();

  const submitProposal = useMutation({
    mutationFn: async (proposalData) => {
      const res = await api.post('/proposals', proposalData);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposals', 'project', variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ['proposals', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.project_id] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
    },
  });

  const acceptProposal = useMutation({
    mutationFn: async ({ proposalId, projectId }) => {
      const res = await api.post(`/proposals/${proposalId}/accept`);
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      queryClient.invalidateQueries({ queryKey: ['proposals', 'project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['proposals', 'my'] });
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['my-projects'] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });

  return {
    submitProposal,
    acceptProposal,
  };
};
