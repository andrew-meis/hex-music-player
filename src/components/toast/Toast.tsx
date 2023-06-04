import { Snackbar, Typography } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { QueryKeys } from 'types/enums';
import { ToastMessage } from 'types/interfaces';

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((
  props,
  ref,
) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

const Toast = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { data: message } = useQuery<ToastMessage>(
    [QueryKeys.TOAST],
    () => ({ type: undefined, text: '' }),
    {
      initialData: { type: undefined, text: '' },
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => {
    if (message.text !== '') {
      setOpen(true);
    }
  }, [message]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => queryClient.refetchQueries([QueryKeys.TOAST]), 300);
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={2000}
      open={open}
      sx={{ zIndex: 2500, '&.MuiSnackbar-root': { bottom: '100px' } }}
      onClose={handleClose}
    >
      <Alert
        icon={false}
        severity={message.type}
        sx={{
          backgroundImage: 'none',
          padding: 0,
        }}
      >
        <Typography
          color={`var(--mui-palette-${message.type}-contrastText)`}
          sx={{ textAlign: 'center', width: '204px' }}
        >
          {message.text}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default Toast;
