import { Box, ClickAwayListener } from '@mui/material';
import React from 'react';
import { ListProps } from 'react-virtuoso';

const mergeRefs = (...refs: any) => {
  const filteredRefs = refs.filter(Boolean);
  if (!filteredRefs.length) return null;
  if (filteredRefs.length === 0) return filteredRefs[0];
  return (inst: Element) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const ref of filteredRefs) {
      if (typeof ref === 'function') {
        ref(inst);
      } else if (ref) {
        ref.current = inst;
      }
    }
  };
};

const ListGrouped = React
  .forwardRef((
    // @ts-ignore
    { style, children, context, 'data-test-id': testId }: ListProps,
    listRef: React.ForwardedRef<HTMLDivElement>,
  ) => {
    if (!context) {
      return null;
    }
    if (testId === 'virtuoso-top-item-list') {
      return (
        <Box
          className="list-box"
          ref={listRef}
          style={{ ...style, maxWidth: '900px', width: '89%' }}
          sx={{ mx: 'auto' }}
        >
          {children}
        </Box>
      );
    }
    return (
      <ClickAwayListener onClickAway={context.handleClickAway}>
        <Box
          className="list-box"
          ref={mergeRefs(context.drag, listRef)}
          style={{ ...style, maxWidth: '900px', width: '89%' }}
          sx={{ mx: 'auto' }}
          onDragEndCapture={() => {
            context.handleClickAway();
            document.querySelectorAll('.track-row')
              .forEach((node) => node.classList.remove('track-row-dragging'));
          }}
          onDragStartCapture={() => {
            document.querySelectorAll('.track-row')
              .forEach((node) => node.classList.add('track-row-dragging'));
          }}
        >
          {children}
        </Box>
      </ClickAwayListener>
    );
  });

export default ListGrouped;
