import { InputBase, SvgIcon, Chip, Box } from '@mui/material';
import { useState } from 'react';
import { TiPlus } from 'react-icons/ti';
import { Filter } from '../FilterPanel';
import { FilterSchema } from '../filterSchemas';

interface FilterInputProps {
  handleAddFilter:({
    type, group, field, label, operator, value, display,
  }: Omit<Filter, 'hash'>) => void;
  group: 'Artist' | 'Album' | 'Track';
  schema: FilterSchema;
}

const FilterBoolean = ({
  handleAddFilter,
  group,
  schema,
}: FilterInputProps) => {
  const options = ['true', 'false'];
  const [count, setCount] = useState(0);
  const operator = schema.operators[0];

  const handleClick = () => {
    let value;
    if (options[count % options.length] === 'true') {
      value = 1;
    } else {
      value = 0;
    }
    handleAddFilter({
      type: schema.type,
      group,
      field: schema.field,
      label: schema.label,
      operator,
      value,
      display: options[count % options.length],
    });
  };

  return (
    <Box>
      <InputBase
        disabled
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
            onClick={handleClick}
          >
            <TiPlus />
          </SvgIcon>
        )}
        inputProps={{
          sx: {
            padding: '4px 6px 5px',
          },
        }}
        startAdornment={(
          <>
            <Chip
              label={operator}
              size="small"
              sx={{ borderRadius: '4px', marginLeft: '5px', width: 'fit-content' }}
            />
            <Chip
              label={options[count % options.length]}
              size="small"
              sx={{ borderRadius: '4px', marginLeft: '5px', width: 'fit-content' }}
              onClick={() => setCount(count + 1)}
            />
          </>
        )}
        sx={{
          backgroundImage: 'var(--mui-overlays-2)',
          borderRadius: '4px',
        }}
      />
    </Box>
  );
};

export default FilterBoolean;
