import React from 'react';
import { ItemProps } from 'react-virtuoso';

const Item = React
  .forwardRef((
    {
      // @ts-ignore
      style, children, context, ...props
    }: ItemProps,
    itemRef: React.ForwardedRef<HTMLDivElement>,
  ) => (
    <div
      {...props}
      ref={itemRef}
      style={style}
      onContextMenu={(event) => context.handleContextMenu(event)}
    >
      {children}
    </div>
  ));

export default Item;
