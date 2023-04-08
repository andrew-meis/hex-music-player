import { useQueryClient, useQuery } from '@tanstack/react-query';
import { isEmpty, range } from 'lodash';
import React, { useCallback } from 'react';

interface UseRowSelection {
  toggleRowSelection: (index: number, event: React.MouseEvent) => void;
  clearRowSelection: () => void;
  getAllSelections: () => number[];
  isRowSelected: (index: number) => boolean;
}

const useRowSelection = (): UseRowSelection => {
  const queryClient = useQueryClient();
  const { data: selectedRows } = useQuery(
    ['selected-rows'],
    () => [],
    {
      initialData: [] as number[],
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  );

  const toggleRowSelection = useCallback(
    (index: number, event: React.MouseEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (selectedRows.includes(index)) {
          const newSelected = selectedRows.filter((n) => n !== index);
          queryClient.setQueryData(['selected-rows'], newSelected);
          return;
        }
        if (!selectedRows.includes(index)) {
          const newSelected = [...selectedRows, index];
          queryClient.setQueryData(['selected-rows'], newSelected);
          return;
        }
      }
      if (event.shiftKey) {
        if (isEmpty(selectedRows)) {
          const newSelected = range(0, index + 1);
          queryClient.setQueryData(['selected-rows'], newSelected);
          return;
        }
        if (index < selectedRows[0]) {
          const newSelected = range(index, selectedRows[selectedRows.length - 1] + 1);
          queryClient.setQueryData(['selected-rows'], newSelected);
          return;
        }
        if (index > selectedRows[selectedRows.length - 1]) {
          const newSelected = range(selectedRows[0], index + 1);
          queryClient.setQueryData(['selected-rows'], newSelected);
          return;
        }
      }
      if (selectedRows.length === 1 && selectedRows.includes(index)) {
        queryClient.setQueryData(['selected-rows'], []);
        return;
      }
      queryClient.setQueryData(['selected-rows'], [index]);
    },
    [queryClient, selectedRows],
  );

  const clearRowSelection = useCallback(() => {
    queryClient.setQueryData(['selected-rows'], []);
  }, [queryClient]);

  const getAllSelections = useCallback(() => selectedRows, [selectedRows]);

  const isRowSelected = useCallback(
    (index: number) => selectedRows.includes(index),
    [selectedRows],
  );

  return {
    toggleRowSelection,
    clearRowSelection,
    getAllSelections,
    isRowSelected,
  };
};

export default useRowSelection;
