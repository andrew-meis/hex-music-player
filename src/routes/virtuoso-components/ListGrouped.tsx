import { Box, ClickAwayListener } from '@mui/material';
import React from 'react';
import { ListProps } from 'react-virtuoso';
import mergeRefs from 'scripts/merge-refs';
import { IVirtuosoContext } from 'types/interfaces';

const ListGrouped = React
  .forwardRef((
    // @ts-ignore
    { style, children, context, 'data-test-id': testId }: ListProps,
    listRef: React.ForwardedRef<HTMLDivElement>,
  ) => {
    const { drag, handleClickAway, hoverIndex, selectedRows } = context as IVirtuosoContext;
    if (!context) {
      return null;
    }
    if (testId === 'virtuoso-top-item-list') {
      return (
        <Box
          className="group-box"
          ref={listRef}
          style={style}
          sx={{ maxWidth: '900px', mx: 'auto', width: '89%' }}
        >
          {children}
        </Box>
      );
    }
    return (
      <ClickAwayListener onClickAway={handleClickAway}>
        <Box
          className="list-box"
          ref={mergeRefs(drag, listRef)}
          style={style}
          sx={{ maxWidth: '900px', mx: 'auto', width: '89%' }}
          onDragEndCapture={() => {
            document.querySelectorAll('div.virtuoso-item')
              .forEach((node) => node.classList.remove('non-dragged-item', 'dragged-item'));
            handleClickAway();
          }}
          onDragStartCapture={() => {
            if (hoverIndex.current === null) {
              return;
            }
            document.querySelectorAll('div.virtuoso-item')
              .forEach((node) => node.classList.add('non-dragged-item'));
            if (selectedRows.length > 1 && selectedRows.includes(hoverIndex.current)) {
              const draggedNodes = selectedRows.map((row) => document
                .querySelector(`div.virtuoso-item[data-item-index='${row}'`));
              draggedNodes
                .forEach((node) => node?.classList.add('dragged-item'));
            } else {
              const draggedNode = document
                .querySelector(`div.virtuoso-item[data-item-index='${hoverIndex.current}'`);
              draggedNode?.classList.add('dragged-item');
            }
          }}
        >
          {children}
        </Box>
      </ClickAwayListener>
    );
  });

export default ListGrouped;
