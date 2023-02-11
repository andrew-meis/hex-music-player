import { isEmpty, range } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';

const useRowSelect = (initialSelect: number[]) => {
  const [selectedRows, setSelectedRows] = useState(initialSelect);

  const handleClickAway = useCallback(() => {
    setSelectedRows([]);
  }, []);

  const handleRowClick = useCallback((event: React.MouseEvent, index: number) => {
    if (event.ctrlKey || event.metaKey) {
      if (selectedRows.includes(index)) {
        const newSelected = selectedRows.filter((n) => n !== index);
        setSelectedRows(newSelected);
        return;
      }
      if (!selectedRows.includes(index)) {
        const newSelected = [...selectedRows, index];
        setSelectedRows(newSelected);
        return;
      }
    }
    if (event.shiftKey) {
      if (isEmpty(selectedRows)) {
        const newSelected = range(0, index + 1);
        setSelectedRows(newSelected);
        return;
      }
      if (index < selectedRows[0]) {
        const newSelected = range(index, selectedRows[selectedRows.length - 1] + 1);
        setSelectedRows(newSelected);
        return;
      }
      if (index > selectedRows[selectedRows.length - 1]) {
        const newSelected = range(selectedRows[0], index + 1);
        setSelectedRows(newSelected);
        return;
      }
    }
    if (selectedRows.length === 1 && selectedRows.includes(index)) {
      setSelectedRows([]);
      return;
    }
    setSelectedRows([index]);
  }, [selectedRows]);

  return useMemo(() => ({
    selectedRows, setSelectedRows, handleRowClick, handleClickAway,
  }), [handleClickAway, handleRowClick, selectedRows]);
};

export default useRowSelect;
