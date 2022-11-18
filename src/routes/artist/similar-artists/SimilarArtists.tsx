import { motion } from 'framer-motion';
import { Album, Artist, Hub, Library } from 'hex-plex';
import { throttle } from 'lodash';
import React, { useMemo } from 'react';
import { Location, useLocation, useOutletContext, useParams } from 'react-router-dom';
import { GroupedVirtuoso } from 'react-virtuoso';
import { useArtist, useLibrary } from '../../../hooks/queryHooks';
import { RouteParams } from '../../../types/interfaces';
import GroupRow from './GroupRow';
import ArtistsRow from './ArtistsRow';

const getCols = (width: number) => {
  if (width >= 1350) {
    return 7;
  }
  if (width < 1350 && width >= 1100) {
    return 6;
  }
  if (width < 1100 && width >= 850) {
    return 5;
  }
  if (width < 850 && width >= 650) {
    return 4;
  }
  if (width < 650) {
    return 3;
  }
  return 5;
};

interface LocationWithState extends Location {
  state: { guid: Artist['guid'], title: Artist['title'] }
}

export interface SimilarArtistGroup {
  _type: string;
  identifier: string;
  text: string;
}

export interface SimilarArtistRow {
  _type: string;
  artists: Artist[];
  grid: { cols: number };
  section: string;
}

export interface SimilarArtistItems {
  rows?: SimilarArtistRow[];
  groups?: SimilarArtistGroup[];
  groupCounts?: number[];
}

export interface SimilarArtistContext {
  artist: { albums: Album[], artist: Artist, hubs: Hub[] } | undefined;
  grid: { cols: number };
  items: SimilarArtistItems;
  library: Library;
  width: number;
}

export interface RowProps {
  index: number;
  context: SimilarArtistContext;
}

const ArtistsRowContent = (props: RowProps) => <ArtistsRow {...props} />;
const GroupRowContent = (props: RowProps) => <GroupRow {...props} />;

const SimilarArtists = () => {
  const location = useLocation() as LocationWithState;
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const artist = useArtist(+id);

  const library = useLibrary();
  const { width } = useOutletContext() as { width: number };
  // create array for virtualization
  const throttledCols = throttle(() => getCols(width), 300, { leading: true });
  const grid = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);
  const items = useMemo(() => {
    if (!artist.data) {
      return {};
    }
    const rows: SimilarArtistRow[] = [];
    const groups: SimilarArtistGroup[] = [];
    const groupCounts: number[] = [];
    artist.data.hubs.forEach((hub) => {
      if (hub.type === 'artist' && hub.size > 0) {
        let count = 0;
        const identifier = hub.hubIdentifier;
        groups.push({ _type: 'subheaderText', identifier, text: hub.title });
        for (let i = 0; i < hub.items.length; i += grid.cols) {
          const row = hub.items.slice(i, i + grid.cols) as Artist[];
          rows.push({
            _type: 'artists', artists: row, grid, section: hub.title,
          });
          count += 1;
        }
        groupCounts.push(count);
      }
    });
    return { rows, groups, groupCounts };
  }, [artist.data, grid]);

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
    }
  };

  const similarArtistContext = useMemo(() => ({
    artist: artist.data,
    grid,
    items,
    library,
    width,
  }), [
    artist.data,
    grid,
    items,
    library,
    width,
  ]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      style={{ height: '100%' }}
    >
      <GroupedVirtuoso
        className="scroll-container"
        context={similarArtistContext}
        groupContent={(index) => GroupRowContent(
          { index, context: similarArtistContext },
        )}
        groupCounts={items.groupCounts}
        increaseViewportBy={{ top: 0, bottom: 500 }}
        isScrolling={handleScrollState}
        itemContent={
          (index, groupIndex, item, context) => ArtistsRowContent({ index, context })
        }
        style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
      />
    </motion.div>
  );
};

export default SimilarArtists;
