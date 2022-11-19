import { Box, Button, Typography } from '@mui/material';
import { useState } from 'react';

const Root = () => {
  const [auth, setAuth] = useState(false);

  if (!auth) {
    return (
      <Box>
        <Button onClick={() => setAuth(true)}>
          Login
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Typography color="text.primary" variant="h1">
        Logged in!
      </Typography>
      <Button onClick={() => setAuth(false)}>
        Logout
      </Button>
    </Box>
  );
};

export default Root;
