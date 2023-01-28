import { useQueryClient } from '@tanstack/react-query';
import { Connection } from 'hex-plex';
import { useEffect } from 'react';
import { useWebSocket } from 'react-use-websocket/dist/lib/use-websocket';
import { QueryKeys } from 'types/enums';

interface PlexServerMessage {
  NotificationContainer: NotificationContainer;
}

interface NotificationContainer {
  size: number;
  type: string;
}

interface TimelineEntry {
  identifier: string;
  sectionID: string;
  itemID: string;
  type: number;
  title: string;
  state: number;
  updatedAt: number;
}

interface TimelineMessage {
  NotificationContainer: {
    TimelineEntry: TimelineEntry[];
    size: number;
    type: string;
  }
}

interface PlexWebSocketProps {
  connection: Connection | undefined;
  token: string;
}

const isServerMessage = (x: any)
  : x is PlexServerMessage => Object.keys(x)[0] === 'NotificationContainer';

const isTimelineMessage = (x: any)
  : x is TimelineMessage => isServerMessage(x) && x.NotificationContainer.type === 'timeline';

const PlexWebSocket = ({ connection, token }: PlexWebSocketProps) => {
  const queryClient = useQueryClient();
  const { address, port } = connection!;
  const { lastJsonMessage } = useWebSocket(
    `ws://${address}:${port}/:/websockets/notifications?X-Plex-Token=${token}`,
  );
  useEffect(() => {
    if (!lastJsonMessage) return;
    if (isTimelineMessage(lastJsonMessage)) {
      lastJsonMessage.NotificationContainer.TimelineEntry.forEach((entry) => {
        const { type, state } = entry;
        if (type === 8 && state === 5) {
          const id = parseInt(entry.itemID, 10);
          queryClient.invalidateQueries([QueryKeys.ARTIST, id]);
          queryClient.invalidateQueries([QueryKeys.ARTIST_APPEARANCES, id]);
          queryClient.invalidateQueries([QueryKeys.ARTIST_TRACKS, id]);
          queryClient.invalidateQueries([QueryKeys.RECENT_TRACKS, id]);
        }
        if (type === 9 && state === 5) {
          const id = parseInt(entry.itemID, 10);
          queryClient.invalidateQueries([QueryKeys.ALBUM, id]);
          queryClient.invalidateQueries([QueryKeys.ALBUM_QUICK, id]);
          queryClient.invalidateQueries([QueryKeys.ALBUM_TRACKS, id]);
        }
      });
    }
  }, [lastJsonMessage, queryClient]);
  return null;
};

export default PlexWebSocket;
