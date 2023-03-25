import { Box, List } from '@mui/material';
import React from 'react';
import ResultRow from './ResultRow';
import type { Result } from 'types/types';

interface Props {
  results: Result[];
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Results = ({
  results, setOpen,
}: Props) => {
  if (results.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        borderRadius: '4px',
        display: 'block',
      }}
      width="auto"
    >
      <List disablePadding>
        {results.map((result) => (
          <ResultRow
            key={result.id}
            result={result}
            setOpen={setOpen}
          />
        ))}
      </List>
    </Box>
  );
};

export default Results;
