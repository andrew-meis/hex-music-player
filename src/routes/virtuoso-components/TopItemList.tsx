import { ComponentType } from 'react';
import { TopItemListProps } from 'react-virtuoso';

const TopItemList: ComponentType<TopItemListProps> = ({
  children,
  ...rest
}: TopItemListProps) => (
  <div {...rest} style={{ ...rest.style, top: 71 }}>
    {children}
  </div>
);

export default TopItemList;
