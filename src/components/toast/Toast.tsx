import { Snackbar, Typography } from '@mui/material';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import { atom, useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';
import { ToastMessage } from 'types/interfaces';

export const toastAtom = atom<ToastMessage>({ type: undefined, text: '' });

const Alert = React.forwardRef<HTMLDivElement, AlertProps>((
  props,
  ref,
) => <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />);

const Toast = () => {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useAtom(toastAtom);

  useEffect(() => {
    if (toast.text !== '') {
      setOpen(true);
      return;
    }
    setOpen(false);
  }, [toast]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => setToast({ type: undefined, text: '' }), 500);
  };

  return (
    <Snackbar
      disableWindowBlurListener
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      autoHideDuration={2000}
      open={open}
      sx={{ zIndex: 2500, '&.MuiSnackbar-root': { bottom: '100px' } }}
      onClose={handleClose}
    >
      <Alert
        icon={false}
        severity={toast.type}
        sx={{
          backgroundImage: 'none',
          padding: 0,
        }}
      >
        <Typography
          color={`var(--mui-palette-${toast.type}-contrastText)`}
          sx={{ textAlign: 'center', width: '204px' }}
        >
          {toast.text}
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default Toast;
