import { InputBase, SvgIcon, Chip, Box, FormHelperText } from '@mui/material';
import React, { useRef, useState } from 'react';
import { TiPlus } from 'react-icons/ti';
import { FilterObject } from './Filter';
import { FilterInput, FilterTypes } from './filterInputs';

interface FilterInputProps {
  error: boolean;
  handleAddFilter:({
    type, group, field, label, operator, value, display,
  }: Omit<FilterObject, 'hash'>) => void;
  group: 'Artist' | 'Album' | 'Track';
  input: FilterInput;
  setError: React.Dispatch<React.SetStateAction<boolean>>;
}

const FilterText = ({
  error,
  handleAddFilter,
  group,
  input,
  setError,
}: FilterInputProps) => {
  const timePeriods = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'years'];
  const [count, setCount] = useState(0);
  const [period, setPeriod] = useState(0);
  const operator = input.operators[count % input.operators.length];
  const timePeriod = timePeriods[period % timePeriods.length];
  const value = useRef<string>();

  const isInputValid = () => {
    const regex = /^[0-9]+$/;
    if (!value.current) return false;
    if (input.type === FilterTypes.INT && !value.current.match(regex)) return false;
    if ((operator === 'is in the last' || operator === 'is not in the last')
      && !value.current.match(regex)) return false;
    return true;
  };

  const handleClick = () => {
    const valid = isInputValid();
    if (!valid) {
      setError(true);
      return;
    }
    setError(false);
    let formattedValue;
    let displayValue;
    if ((operator === 'is in the last' || operator === 'is not in the last')) {
      formattedValue = `-${value.current}${timePeriod}`;
      // eslint-disable-next-line max-len
      displayValue = value.current === '1' ? timePeriod.substring(0, timePeriod.length - 1) : `${value.current} ${timePeriod}`;
    }
    handleAddFilter({
      type: input.type,
      group,
      field: input.field,
      label: input.label,
      operator,
      value: formattedValue || value.current,
      display: displayValue || value.current,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const valid = isInputValid();
    if (!valid) {
      setError(true);
      return;
    }
    setError(false);
    let formattedValue;
    let displayValue;
    if ((operator === 'is in the last' || operator === 'is not in the last')) {
      formattedValue = `-${value.current}${timePeriod}`;
      // eslint-disable-next-line max-len
      displayValue = value.current === '1' ? timePeriod.substring(0, timePeriod.length - 1) : `${value.current} ${timePeriod}`;
    }
    handleAddFilter({
      type: input.type,
      group,
      field: input.field,
      label: input.label,
      operator,
      value: formattedValue || value.current,
      display: displayValue || value.current,
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
    >
      <InputBase
        fullWidth
        endAdornment={(
          <>
            {(operator === 'is in the last' || operator === 'is not in the last') && (
              <Chip
                label={timePeriod}
                size="small"
                sx={{ borderRadius: '4px', marginRight: '5px', width: 'fit-content' }}
                onClick={() => setPeriod(period + 1)}
              />
            )}
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
          </>
        )}
        inputProps={{
          sx: {
            padding: '4px 6px 5px',
          },
        }}
        startAdornment={(
          <Chip
            label={operator}
            size="small"
            sx={{ borderRadius: '4px', marginLeft: '5px', width: 'fit-content' }}
            onClick={() => setCount(count + 1)}
          />
        )}
        sx={{
          backgroundImage: 'var(--mui-overlays-2)',
          borderRadius: '4px',
        }}
        type={operator === 'is before' || operator === 'is after' ? 'date' : 'text'}
        onChange={(e) => {
          value.current = e.target.value;
        }}
        onKeyUp={(e) => {
          if ((operator === 'is before' || operator === 'is after') && e.key === 'Enter') {
            handleClick();
          }
        }}
      />
      {error && (
        <FormHelperText error sx={{ height: 18, lineHeight: 1.5, ml: '4px' }}>
          Invalid entry. Must enter number.
        </FormHelperText>
      )}
    </Box>
  );
};

export default FilterText;
