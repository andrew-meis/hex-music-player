import { Box, Chip, MenuItem, SelectChangeEvent } from '@mui/material';
import hash from 'object-hash';
import React, { useState } from 'react';
import Select from 'components/select/Select';
import { FilterObject } from './Filter';
import FilterAutocomplete from './FilterAutocomplete';
import FilterBoolean from './FilterBoolean';
import filterInputs, { FilterInput } from './filterInputs';
import FilterRating from './FilterRating';
import FilterText from './FilterText';

interface AddFilterProps {
  error: boolean;
  filters: FilterObject[];
  setError: React.Dispatch<React.SetStateAction<boolean>>;
  setFilters: React.Dispatch<React.SetStateAction<FilterObject[]>>;
}

const AddFilter = ({ error, filters, setError, setFilters }: AddFilterProps) => {
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
    setInputGroup(newGroup);
    setSelectValue('title');
    setActiveInput(filterInputs[0]);
    setCount(count + 1);
  };

  return (
    <Box
      border="1px solid"
      borderColor="border.main"
      borderRadius="4px"
      marginBottom="4px"
      padding={0.5}
      sx={{
        backgroundImage: 'var(--mui-palette-common-overlay)',
      }}
    >
      <Box display="flex" gap="4px">
        {['Artist', 'Album', 'Track'].map((group) => (
          <Chip
            key={group}
            label={group}
            sx={{
              background: 'transparent',
              borderRadius: '4px',
              color: inputGroup === group ? 'text.primary' : 'text.secondary',
              flexGrow: 1,
              fontSize: '1rem',
              fontWeight: inputGroup === group ? 700 : 400,
              '&:hover': {
                background: 'transparent',
                color: 'text.primary',
              },
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
                maxHeight: 324,
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
          inputProps={{
            sx: {
              backgroundColor: 'transparent',
              borderRadius: '4px',
              transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
              '&:focus': {
                backgroundColor: 'transparent',
                borderRadius: '4px',
              },
              '&:hover': {
                borderRadius: '4px',
                backgroundColor: 'action.hover',
              },
            },
          }}
          sx={{
            width: '100%',
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
        {activeInput.field === 'unmatched' && (
          <FilterBoolean
            group={inputGroup}
            handleAddFilter={handleAddFilter}
            input={activeInput}
          />
        )}
        {activeInput.field === 'userRating' && (
          <FilterRating
            group={inputGroup}
            handleAddFilter={handleAddFilter}
            input={activeInput}
          />
        )}
        {activeInput.options && !['unmatched', 'userRating'].includes(activeInput.field) && (
          <FilterAutocomplete
            group={inputGroup}
            handleAddFilter={handleAddFilter}
            input={activeInput}
          />
        )}
        {!activeInput.options && (
          <FilterText
            error={error}
            group={inputGroup}
            handleAddFilter={handleAddFilter}
            input={activeInput}
            setError={setError}
          />
        )}
      </Box>
    </Box>
  );
};

export default AddFilter;
