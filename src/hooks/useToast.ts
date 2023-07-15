import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { QueryKeys } from 'types/enums';
import { ToastMessage } from 'types/interfaces';

const useToast = () => {
  const queryClient = useQueryClient();
  return useCallback(({ type, text }: ToastMessage) => {
    queryClient.setQueryData([QueryKeys.TOAST], { type, text });
  }, [queryClient]);
};

export default useToast;
