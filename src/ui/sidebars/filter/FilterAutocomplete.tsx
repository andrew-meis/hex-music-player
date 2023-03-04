import {
  InputBase,
  SvgIcon,
  Chip,
  Autocomplete,
  Box,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { isString } from 'lodash';
import { useRef, useState } from 'react';
import { FaTimes, TiPlus } from 'react-icons/all';
import { useConfig, useLibrary } from 'queries/app-queries';
import { filterOptionsQueryFn } from 'queries/library-query-fns';
import { FilterObject } from './Filter';
import { FilterInput } from './filterInputs';

const groups = {
  Artist: 8,
  Album: 9,
  Track: 10,
};

interface Option {
  id: number;
  title: string;
}

interface FilterAutocompleteProps {
  handleAddFilter:({
    type, group, field, label, operator, value, display,
  }: Omit<FilterObject, 'hash'>) => void;
  input: FilterInput;
  group: 'Artist' | 'Album' | 'Track';
}

const FilterAutocomplete = ({
  handleAddFilter, input, group,
}: FilterAutocompleteProps) => {
  const config = useConfig();
  const library = useLibrary();
  const [count, setCount] = useState(0);
  const [disableInput, setDisableInput] = useState(false);
  const value = useRef<Option>();
  const { data: options } = useQuery(
    [input.field, group],
    () => filterOptionsQueryFn({
      config: config.data,
      field: input.field,
      library,
      type: groups[group],
    }),
    {
      initialData: [],
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  return (
    <Box
      component="form"
      onClick={(e) => e.stopPropagation()}
      onSubmit={(e) => {
        e.preventDefault();
        if (value.current) {
          handleAddFilter({
            type: input.type,
            group,
            field: input.field,
            label: input.label,
            operator: input.operators[count % input.operators.length],
            value: value.current.id,
            display: value.current.title,
          });
        }
      }}
    >
      <Autocomplete
        disableClearable
        freeSolo
        fullWidth
        multiple
        ListboxProps={{
          className: 'scroll-container',
          style: {
            backgroundImage: 'var(--mui-overlays-2)',
            overflow: 'overlay',
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
        getOptionLabel={(option) => {
          if (isString(option)) {
            return option;
          }
          return option.title;
        }}
        options={options}
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
                    if (value.current) {
                      handleAddFilter({
                        type: input.type,
                        group,
                        field: input.field,
                        label: input.label,
                        operator: input.operators[count % input.operators.length],
                        value: value.current.id,
                        display: value.current.title,
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
                '& .MuiAutocomplete-input': {
                  minWidth: '0 !important',
                  padding: '4px 6px 5px',
                },
              }}
            />
          );
        }}
        renderOption={(props, option) => (
          <li {...props}>
            <Typography
              lineHeight={1}
            >
              {option.title}
            </Typography>
          </li>
        )}
        renderTags={(values: Option[], getTagProps) => (
          values.map((option: Option, index: number) => (
            <Chip
              label={option.title.toString()}
              size="small"
              sx={{
                borderRadius: '4px',
                marginLeft: '5px',
                maxWidth: 'calc(100% - 72px) !important',
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
        onChange={(e, values) => {
          setDisableInput(values.length > 0);
          if (values.length > 0) {
            if (isString(values[0])) return;
            [value.current] = values;
          }
        }}
      />
    </Box>
  );
};

export default FilterAutocomplete;
