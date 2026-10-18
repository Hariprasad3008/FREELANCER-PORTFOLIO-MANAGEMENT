import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api.js';

export const useMyContracts = () => {
  return useQuery({
    queryKey: ['contracts', 'my'],
    queryFn: async () => {
      const res = await api.get('/contracts/my');
      return res.data;
    },
  });
};

export const useContractMutations = () => {
  const queryClient = useQueryClient();

  const completeContract = useMutation({
    mutationFn: async (contractId) => {
      const res = await api.put(`/contracts/${contractId}/complete`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  return {
    completeContract,
  };
};
