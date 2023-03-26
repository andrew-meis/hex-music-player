import { Box, ClickAwayListener } from '@mui/material';
import React from 'react';
import { ListProps } from 'react-virtuoso';
import { WIDTH_CALC } from 'constants/measures';
import mergeRefs from 'scripts/merge-refs';
import { VirtuosoContext } from 'types/interfaces';

const List = React
  .forwardRef((
    // @ts-ignore
    { style, children, context }: ListProps,
    listRef: React.ForwardedRef<HTMLDivElement>,
  ) => {
    const { handleClickAway, hoverIndex, selectedRows } = context as VirtuosoContext;
    return (
      <ClickAwayListener onClickAway={context.handleClickAway}>
        <Box
          className="list-box"
          ref={mergeRefs(context.drag, listRef)}
          style={style}
          sx={{ maxWidth: '900px', mx: 'auto', width: WIDTH_CALC }}
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

export default List;
