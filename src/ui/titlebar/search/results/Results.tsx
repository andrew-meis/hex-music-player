import { Box, List, Typography } from '@mui/material';
import React from 'react';
import { Result } from '../../../../types/types';
import ResultRow from './ResultRow';

interface Props {
  results: Result[];
  type: 'artist' | 'album' | 'track';
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  options: { showLabel: boolean, showNumber: boolean };
}

const Results = ({
  results, type, setOpen, options,
}: Props) => {
  const labelText = () => {
    switch (type) {
      case 'artist':
        return 'Artists';
      case 'album':
        return 'Albums';
      case 'track':
        return 'Tracks';
      default:
        throw new Error('no matching type');
    }
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <>
      {options.showLabel
        && (
          <Typography sx={{ marginLeft: '8px' }}>
            {labelText()}
          </Typography>
        )}
      <Box
        height="calc(100% - 26px)"
        sx={{
          borderRadius: '4px',
          display: 'block',
        }}
        width="auto"
      >
        <List disablePadding>
          {results.map((result, index) => (
            <ResultRow
              index={index}
              key={result.id}
              options={options}
              result={result}
              setOpen={setOpen}
            />
          ))}
        </List>
      </Box>
    </>
  );
};

export default Results;
