import { Box, Chip, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { QueryKeys } from 'types/enums';
import AddFilter from './AddFilter';
import { FilterTypes, Operators } from './filterInputs';
import { Rating } from './FilterRating';
import SortSelect from './SortSelect';

export interface FilterObject {
  type: FilterTypes;
  group: 'Artist' | 'Album' | 'Track';
  field: string;
  label: string;
  operator: Operators;
  value: string | number | undefined;
  display: string | number | undefined;
  hash: string;
}

const FilterNew = ({ pathname }: { pathname: string }) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<FilterObject[]>([]);

  useEffect(() => {
    queryClient.setQueryData([QueryKeys.FILTERS], filters);
  }, [filters, queryClient]);

  const handleRemoveFilter = (filterHash: string) => {
    const newFilters = filters.filter((filter) => filter.hash !== filterHash);
    setFilters(newFilters);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      height={1}
      marginBottom="4px"
      marginLeft="4px"
      overflow="hidden"
    >
      <Box
        alignItems="center"
        borderRadius="4px"
        color="text.primary"
        display="flex"
        justifyContent="flex-end"
        paddingY="8px"
        width={1}
      >
        <Typography fontSize="1.5rem" fontWeight={600} mr="8px">Filters + Sorting</Typography>
      </Box>
      <Box alignItems="center" ml="6px" mr="14px">
        <Typography fontFamily="TT Commons" variant="overline">
          Sorting
        </Typography>
        {pathname === '/albums' && (
          <SortSelect key={pathname} pathname={pathname} />
        )}
        {pathname === '/artists' && (
          <SortSelect key={pathname} pathname={pathname} />
        )}
        {pathname === '/tracks' && (
          <SortSelect key={pathname} pathname={pathname} />
        )}
      </Box>
      <Box alignItems="center" ml="6px" mr="14px">
        <Typography fontFamily="TT Commons" variant="overline">
          Filters
        </Typography>
        <Box width={1}>
          {filters.length > 0 && filters.map((filter) => (
            <Chip
              deleteIcon={(
                <FaTimes />
              )}
              key={filter.hash}
              label={(
                <Box
                  alignItems="center"
                  display="inline-flex"
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Typography component="span" display="inline" fontSize="0.8125rem">
                    {`${filter.group} ${filter.label.toLowerCase()}`}
                  </Typography>
                  <Typography
                    component="span"
                    display="inline"
                    fontSize="0.8125rem"
                    sx={{ color: 'text.secondary' }}
                  >
                    &nbsp;
                    {`${filter.operator}`}
                    &nbsp;
                  </Typography>
                  {filter.field === 'userRating' && filter.value === -1 && (
                    <Typography component="span" display="inline" fontSize="0.8125rem">
                      unrated
                    </Typography>
                  )}
                  {filter.field === 'userRating' && filter.value !== -1 && (
                    <Rating value={filter.value as number} />
                  )}
                  {filter.field !== 'userRating' && (
                    <Typography component="span" display="inline" fontSize="0.8125rem">
                      {`${filter.display?.toString().toLowerCase()}`}
                    </Typography>
                  )}
                </Box>
              )}
              size="small"
              sx={{
                borderRadius: '4px',
                marginBottom: '4px',
                marginRight: '4px',
                maxWidth: 'calc(100% - 10px)',
                width: 'fit-content',
                '& .MuiChip-deleteIcon': {
                  color: 'text.secondary',
                  marginRight: '4px',
                  '&:hover': {
                    color: 'error.main',
                  },
                },
                '& .MuiChip-label': {
                  alignItems: 'center',
                  display: 'flex',
                },
              }}
              onDelete={() => handleRemoveFilter(filter.hash)}
            />
          ))}
        </Box>
        <AddFilter filters={filters} setFilters={setFilters} />
      </Box>
    </Box>
  );
};

export default FilterNew;
