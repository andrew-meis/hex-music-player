import { useQueryClient } from '@tanstack/react-query';
import type { ToastMessage } from 'types/interfaces';

const useToast = () => {
  const queryClient = useQueryClient();
  return ({ type, text }: ToastMessage) => {
    queryClient.setQueryData(['toast'], { type, text });
  };
};

export default useToast;
