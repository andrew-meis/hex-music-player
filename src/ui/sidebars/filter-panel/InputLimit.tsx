import { Box, InputAdornment, InputBase, SvgIcon } from '@mui/material';
import { atom, useAtom } from 'jotai';
import React from 'react';
import { FaTimes } from 'react-icons/fa';

export const limitAtom = atom('');

const InputLimit = () => {
  const [limit, setLimit] = useAtom(limitAtom);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { value } = e.target;
    setLimit(value);
  };

  const handleClear = () => {
    setLimit('');
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <Box
      borderRadius="4px"
      component="form"
      height="32px"
      marginBottom="4px"
      sx={{
        backgroundColor: 'var(--mui-palette-action-disabledBackground)',
      }}
      onSubmit={handleSubmit}
    >
      <InputBase
        fullWidth
        endAdornment={(
          <InputAdornment
            position="end"
            sx={{ cursor: 'pointer' }}
            onClick={handleClear}
          >
            <SvgIcon
              sx={{
                mr: '8px',
                mt: '2px',
                color: 'text.secondary',
                display: limit.length > 0 ? 'inline-block' : 'none',
                width: '0.7em',
                '&:hover': {
                  color: 'error.main',
                },
              }}
            >
              <FaTimes />
            </SvgIcon>
          </InputAdornment>
        )}
        inputProps={{
          min: 0,
          style: { padding: '4px 8px 4px' },
          spellCheck: false,
        }}
        type="number"
        value={limit}
        onChange={handleChange}
      />
    </Box>
  );
};

export default InputLimit;
