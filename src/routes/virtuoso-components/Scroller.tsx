import React from 'react';
import { ScrollerProps } from 'react-virtuoso';

const Scroller = React
  .forwardRef((
    { style, ...props }: ScrollerProps,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => (
    <div
      className="virtuoso-scroller"
      ref={ref}
      style={{ ...style, top: 72 }}
      {...props}
    />
  ));

export default Scroller;
