import React from 'react';
import { ItemProps } from 'react-virtuoso';

const Item = React
  .forwardRef((
    {
      // @ts-ignore
      style, children, context, ...props
    }: ItemProps<any>,
    itemRef: React.ForwardedRef<HTMLDivElement>,
  ) => (
    <div
      {...props}
      className="virtuoso-item"
      ref={itemRef}
      style={style}
      onContextMenu={(event) => context.handleContextMenu(event)}
    >
      {children}
    </div>
  ));

export default Item;
