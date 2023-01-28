import React from 'react';
import { GroupProps } from 'react-virtuoso';

const Group = React
  .forwardRef((
    {
      // @ts-ignore
      style, children, ...props
    }: GroupProps,
    groupRef: React.ForwardedRef<HTMLDivElement>,
  ) => (
    <div
      {...props}
      className="virtuoso-group-item"
      ref={groupRef}
      style={{ ...style, top: 71 }}
    >
      {children}
    </div>
  ));

export default Group;
