import { Components, Virtuoso } from 'react-virtuoso';
import { Track } from 'api/index';
import Footer from 'routes/virtuoso-components/Footer';
import Item from 'routes/virtuoso-components/Item';
import List from 'routes/virtuoso-components/List';
import ScrollSeekPlaceholder from 'routes/virtuoso-components/ScrollSeekPlaceholder';

const defaultComponents = {
  Footer,
  Item,
  List,
  ScrollSeekPlaceholder,
};

interface TrackVirtuosoProps {
  // eslint-disable-next-line react/require-default-props
  components?: Components<any, any>;
  data: Track[];
}

const TrackVirtuoso = ({
  components,
  data,
}: TrackVirtuosoProps) => {
  console.log('none');
  return (
    <Virtuoso
      className="scroll-container"
      components={{
        ...defaultComponents,
        ...components,
      }}
      data={data}
      fixedItemHeight={56}
    />
  );
};

export default TrackVirtuoso;
