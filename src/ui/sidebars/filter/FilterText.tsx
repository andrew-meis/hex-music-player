import { InputBase, SvgIcon, Chip, Box } from '@mui/material';
import { useRef, useState } from 'react';
import { TiPlus } from 'react-icons/all';
import { FilterObject } from './Filter';
import { FilterInput } from './filterInputs';

interface FilterInputProps {
  handleAddFilter:({
    type, group, field, label, operator, value, display,
  }: Omit<FilterObject, 'hash'>) => void;
  input: FilterInput;
  group: 'Artist' | 'Album' | 'Track';
}

const FilterText = ({
  handleAddFilter,
  input,
  group,
}: FilterInputProps) => {
  const [count, setCount] = useState(0);
  const value = useRef<string | number>();
  return (
    <Box
      component="form"
      onClick={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        e.preventDefault();
        handleAddFilter({
          type: input.type,
          group,
          field: input.field,
          label: input.label,
          operator: input.operators[count % input.operators.length],
          value: value.current,
          display: value.current,
        });
      }}
    >
      <InputBase
        fullWidth
        endAdornment={(
          <SvgIcon
            sx={{
              cursor: 'pointer',
              marginRight: '5px',
              width: '0.7em',
              '&:hover': {
                color: 'primary.main',
              },
            }}
            onClick={() => handleAddFilter({
              type: input.type,
              group,
              field: input.field,
              label: input.label,
              operator: input.operators[count % input.operators.length],
              value: value.current,
              display: value.current,
            })}
          >
            <TiPlus />
          </SvgIcon>
        )}
        inputProps={{
          style: {
            padding: '4px 6px 5px',
          },
        }}
        startAdornment={(
          <Chip
            label={input.operators[count % input.operators.length]}
            size="small"
            sx={{ borderRadius: '4px', marginLeft: '5px', width: 'fit-content' }}
            onClick={() => setCount(count + 1)}
          />
        )}
        sx={{
          backgroundImage: 'var(--mui-overlays-2)',
          borderRadius: '4px',
        }}
        onChange={(e) => {
          value.current = e.target.value;
        }}
      />
    </Box>
  );
};

export default FilterText;
