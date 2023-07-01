import { Box, ClickAwayListener } from '@mui/material';
import React from 'react';
import { WIDTH_CALC } from 'constants/measures';
import mergeRefs from 'scripts/merge-refs';

interface ListBoxProps {
  children: React.ReactNode;
  clearRowSelection: () => void;
  drag: (node: any) => void;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement, MouseEvent>, index: number) => void;
  hoverIndex: React.MutableRefObject<number | null>;
  id?: string;
  listRef: React.ForwardedRef<HTMLDivElement>;
  selectedRows: number[];
  style: React.CSSProperties | undefined;
}

const ListBox = ({
  children,
  clearRowSelection,
  drag,
  handleContextMenu,
  hoverIndex,
  id,
  listRef,
  selectedRows,
  style,
  ...rest
}: ListBoxProps) => (
  <ClickAwayListener onClickAway={clearRowSelection}>
    <Box
      className="list-box"
      id={id}
      ref={mergeRefs(drag, listRef)}
      style={style}
      sx={{ maxWidth: '900px', mx: 'auto', width: WIDTH_CALC }}
      onContextMenu={(event) => handleContextMenu(event, hoverIndex.current!)}
      onDragEndCapture={() => {
        clearRowSelection();
        const nodes = document.querySelectorAll('div.track');
        nodes.forEach((node) => node.classList.remove('non-dragged', 'dragged'));
      }}
      onDragStartCapture={() => {
        if (hoverIndex.current === null) {
          return;
        }
        const nodes = document.querySelectorAll('div.track');
        nodes.forEach((node) => node.classList.add('non-dragged'));
        if (selectedRows.length > 1 && selectedRows.includes(hoverIndex.current)) {
          const draggedNodes = selectedRows.map((row) => document
            .querySelector(`div.track[data-item-index='${row}'`));
          draggedNodes.forEach((node) => node?.classList.add('dragged'));
        } else {
          const draggedNode = document
            .querySelector(`div.track[data-item-index='${hoverIndex.current}'`);
          draggedNode?.classList.add('dragged');
        }
      }}
      {...rest}
    >
      {children}
    </Box>
  </ClickAwayListener>
);

ListBox.defaultProps = {
  id: undefined,
};

export default ListBox;
