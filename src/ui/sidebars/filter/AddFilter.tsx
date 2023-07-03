import { Box, Chip, MenuItem, SelectChangeEvent, Typography } from '@mui/material';
import hash from 'object-hash';
import React, { useState } from 'react';
import Select from 'components/select/Select';
import { FilterObject } from './Filter';
import FilterAutocomplete from './FilterAutocomplete';
import filterInputs, { FilterInput } from './filterInputs';
import FilterRating from './FilterRating';
import FilterText from './FilterText';

interface AddFilterProps {
  filters: FilterObject[];
  setFilters: React.Dispatch<React.SetStateAction<FilterObject[]>>;
}

const AddFilter = ({ filters, setFilters }: AddFilterProps) => {
  const [activeInput, setActiveInput] = useState<FilterInput>(filterInputs[0]);
  const [count, setCount] = useState(0);
  const [inputGroup, setInputGroup] = useState<'Album' | 'Artist' | 'Track'>('Artist');
  const [selectValue, setSelectValue] = useState('title');

  const handleAddFilter = ({
    type, group, field, label, operator, value, display,
  } : Omit<FilterObject, 'hash'>) => {
    if (!value) return;
    const newFilter = {
      type,
      group,
      field,
      label,
      operator,
      value,
      display,
    } as FilterObject;
    const filterHash = hash.sha1(newFilter);
    newFilter.hash = filterHash;
    if (filters.some((currentFilter) => currentFilter.hash === filterHash)) return;
    const newFilters = [...filters, newFilter];
    setFilters(newFilters);
    setCount(count + 1);
  };

  const handleSelectChange = (event: SelectChangeEvent) => {
    setActiveInput(filterInputs.find((input) => input.field === event.target.value)!);
    setSelectValue(event.target.value as string);
    setCount(count + 1);
  };

  const updateInputGroup = (newGroup: 'Album' | 'Artist' | 'Track') => {
    setSelectValue('title');
    setActiveInput(filterInputs[0]);
    setInputGroup(newGroup);
    setCount(count + 1);
  };

  return (
    <Box
      border="1px solid"
      borderColor="border.main"
      borderRadius="4px"
      padding={0.5}
      sx={{
        backgroundImage: 'var(--mui-overlays-5)',
      }}
    >
      <Typography textAlign="center" variant="subtitle2">
        new filter
      </Typography>
      <Box display="flex" gap="4px">
        {['Artist', 'Album', 'Track'].map((group) => (
          <Chip
            key={group}
            label={group}
            sx={{
              background: inputGroup === group ? 'var(--mui-palette-common-grey)' : 'transparent',
              borderRadius: '4px',
              flexGrow: 1,
              fontSize: '1rem',
            }}
            onClick={() => updateInputGroup(group as 'Album' | 'Artist' | 'Track')}
          />
        ))}
      </Box>
      <Box mt="4px">
        <Select
          fullWidth
          MenuProps={{
            PaperProps: {
              className: 'scroll-container',
              style: {
                maxHeight: 252,
                overflow: 'overlay',
              },
            },
            anchorOrigin: {
              vertical: 'bottom',
              horizontal: 'center',
            },
            sx: {
              marginTop: '4px',
              '& .MuiList-root': {
                padding: 0,
              },
            },
            transformOrigin: {
              vertical: 'top',
              horizontal: 'center',
            },
            marginThreshold: 0,
          }}
          sx={{
            transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            width: '100%',
            '&:hover': {
              borderRadius: '4px',
              backgroundColor: 'action.hover',
            },
          }}
          value={selectValue}
          onChange={(e) => handleSelectChange(e as SelectChangeEvent)}
        >
          {filterInputs
            .filter((input) => input.groups.includes(inputGroup))
            .map((input) => (
              <MenuItem
                key={input.field}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
                value={input.field}
              >
                {input.label}
              </MenuItem>
            ))}
        </Select>
      </Box>
      <Box key={count} mt="4px">
        {activeInput.field === 'userRating' && (
          <FilterRating
            group={inputGroup}
            handleAddFilter={handleAddFilter}
            input={activeInput}
          />
        )}
        {activeInput.options && activeInput.field !== 'userRating' && (
          <FilterAutocomplete
            group={inputGroup}
            handleAddFilter={handleAddFilter}
            input={activeInput}
          />
        )}
        {!activeInput.options && (
          <FilterText
            group={inputGroup}
            handleAddFilter={handleAddFilter}
            input={activeInput}
          />
        )}
      </Box>
    </Box>
  );
};

export default AddFilter;
