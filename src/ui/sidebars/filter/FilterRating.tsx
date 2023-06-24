import {
  InputBase,
  SvgIcon,
  Chip,
  Autocomplete,
  Box,
  Rating as MuiRating,
  Typography,
} from '@mui/material';
import { isNumber } from 'lodash';
import { useRef, useState } from 'react';
import { BsDot } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import { TiPlus } from 'react-icons/ti';
import { FilterObject } from './Filter';
import { FilterInput } from './filterInputs';

export const Rating = ({ value }: {value: number}) => (
  <MuiRating
    readOnly
    emptyIcon={(
      <SvgIcon
        sx={{
          color: 'text.secondary',
          width: '16px',
          height: '16px',
        }}
      >
        <BsDot />
      </SvgIcon>
    )}
    size="small"
    sx={{
      display: 'flex',
      '&.MuiRating-root': {
        fontSize: '1rem',
      },
    }}
    value={value / 2}
  />
);

const renderOption = (option: string | number) => {
  switch (true) {
    case isNumber(option) && option === -1:
      return <Typography lineHeight={1}>unrated</Typography>;
    case isNumber(option) && option >= 0:
      return <Rating value={option as number} />;
    default:
      return '';
  }
};

interface FilterRatingProps {
  handleAddFilter:({
    type, group, field, label, operator, value, display,
  }: Omit<FilterObject, 'hash'>) => void;
  input: FilterInput;
  group: 'Artist' | 'Album' | 'Track';
}

const FilterRating = ({ handleAddFilter, input, group }: FilterRatingProps) => {
  const [count, setCount] = useState(0);
  const [disableInput, setDisableInput] = useState(false);
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
      <Autocomplete
        disableClearable
        disablePortal
        freeSolo
        fullWidth
        multiple
        ListboxProps={{
          style: {
            backgroundImage: 'var(--mui-overlays-2)',
          },
        }}
        componentsProps={{
          popper: {
            modifiers: [
              {
                name: 'offset',
                options: {
                  offset: [0, 4],
                },
              },
            ],
          },
        }}
        disabled={disableInput}
        getOptionLabel={(opt) => opt.toString()}
        options={input.options!}
        renderInput={(params) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { InputLabelProps, InputProps, ...rest } = params;
          return (
            <InputBase
              {...InputProps}
              {...rest}
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
                  onClick={() => {
                    if (value.current && input.options?.includes(value.current)) {
                      handleAddFilter({
                        type: input.type,
                        group,
                        field: input.field,
                        label: input.label,
                        operator: input.operators[count % input.operators.length],
                        value: value.current,
                        display: value.current,
                      });
                    }
                  }}
                >
                  <TiPlus />
                </SvgIcon>
              )}
              startAdornment={(
                <>
                  <Chip
                    label={input.operators[count % input.operators.length]}
                    size="small"
                    sx={{
                      borderRadius: '4px',
                      marginLeft: '5px',
                      width: 'fit-content',
                    }}
                    onClick={() => setCount(count + 1)}
                  />
                  {params.InputProps.startAdornment}
                </>
              )}
              sx={{
                backgroundImage: 'var(--mui-overlays-2)',
                borderRadius: '4px',
                caretColor: 'transparent',
                '& .MuiAutocomplete-input': {
                  cursor: 'pointer',
                  minWidth: '0 !important',
                  padding: '4px 6px 5px',
                },
              }}
            />
          );
        }}
        renderOption={(props, opt) => (
          <li {...props}>
            {renderOption(opt)}
          </li>
        )}
        renderTags={(values: (string | number)[], getTagProps) => (
          values.map((opt: string | number, index: number) => (
            <Chip
              label={isNumber(opt) && opt > 0
                ? <Rating value={opt as number} />
                : 'unrated'}
              size="small"
              sx={{
                borderRadius: '4px',
                marginLeft: '5px',
                width: 'fit-content',
                '& .MuiChip-deleteIcon': {
                  color: 'text.secondary',
                  marginRight: '4px',
                  '&:hover': {
                    color: 'error.main',
                  },
                },
              }}
              {...getTagProps({ index })}
              deleteIcon={(
                <FaTimes />
              )}
              disabled={false}
            />
          ))
        )}
        sx={{
          '& .Mui-disabled': {
            color: 'text.primary',
          },
        }}
        onChange={(e, values) => {
          setDisableInput(values.length > 0);
          if (values.length > 0) {
            [value.current] = values;
          } else {
            value.current = undefined;
          }
        }}
        onKeyDown={(e) => e.preventDefault()}
      />
    </Box>
  );
};

export default FilterRating;
