import { useQueryClient } from '@tanstack/react-query';
import { QueryKeys } from 'types/enums';
import { ToastMessage } from 'types/interfaces';

const useToast = () => {
  const queryClient = useQueryClient();
  return ({ type, text }: ToastMessage) => {
    queryClient.setQueryData([QueryKeys.TOAST], { type, text });
  };
};

export default useToast;
