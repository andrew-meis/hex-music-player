const PlexWebSocket = () => {
  const host = '0.0.0.0';
  const token = 0;
  const socket = new WebSocket(
    `ws://${host}:32400/:/websockets/notifications?X-Plex-Token=${token}`,
  );
  socket.onopen = () => {
    console.log('open');
  };
  socket.onmessage = (event) => {
    console.log(`[message] Data received from server: ${event.data}`);
  };
  return null;
};

export default PlexWebSocket;
