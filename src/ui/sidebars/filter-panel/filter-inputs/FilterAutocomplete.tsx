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
import { FaTimes } from 'react-icons/fa';
import { TiPlus } from 'react-icons/ti';
import { useConfig, useLibrary } from 'queries/app-queries';
import { filterOptionsQueryFn, MediaTag } from 'queries/library-query-fns';
import { Filter } from '../FilterPanel';
import { FilterSchema } from '../filterSchemas';

const groups = {
  Artist: 8,
  Album: 9,
  Track: 10,
};

interface FilterAutocompleteProps {
  handleAddFilter:({
    type, group, field, label, operator, value, display,
  }: Omit<Filter, 'hash'>) => void;
  group: 'Artist' | 'Album' | 'Track';
  schema: FilterSchema;
}

const FilterAutocomplete = ({
  handleAddFilter, group, schema,
}: FilterAutocompleteProps) => {
  const config = useConfig();
  const library = useLibrary();
  const [count, setCount] = useState(0);
  const [disableInput, setDisableInput] = useState(false);
  const [open, setOpen] = useState(false);
  const value = useRef<MediaTag>();
  const { data: options } = useQuery(
    [schema.field, group],
    () => filterOptionsQueryFn({
      config: config.data,
      field: schema.field,
      library,
      type: groups[group],
    }),
    {
      enabled: open,
      initialData: [],
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.current) {
          handleAddFilter({
            type: schema.type,
            group,
            field: schema.field,
            label: schema.label,
            operator: schema.operators[count % schema.operators.length],
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
            backgroundImage: 'var(--mui-overlays-8)',
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
                    color: 'text.primary',
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
                        type: schema.type,
                        group,
                        field: schema.field,
                        label: schema.label,
                        operator: schema.operators[count % schema.operators.length],
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
                    label={schema.operators[count % schema.operators.length]}
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
        renderTags={(values: MediaTag[], getTagProps) => (
          values.map((option: MediaTag, index: number) => (
            <Chip
              label={option.title.toString()}
              size="small"
              sx={{
                borderRadius: '4px',
                flexShrink: 1,
                marginLeft: '5px',
                minWidth: '0 !important',
                width: 'fit-content',
                '& .MuiChip-deleteIcon': {
                  color: 'text.secondary',
                  flexShrink: 0,
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
          '& .MuiAutocomplete-inputRoot': {
            flexWrap: 'nowrap',
          },
        }}
        onChange={(e, values) => {
          setDisableInput(values.length > 0);
          if (values.length > 0) {
            if (isString(values[0])) return;
            [value.current] = values;
          }
        }}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
      />
    </Box>
  );
};

export default FilterAutocomplete;
