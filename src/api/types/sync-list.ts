import Prism from '@zwolf/prism';
import { toDevice } from './device';
import { toMediaContainer } from './media-container';
import { createParser } from './parser';

const toServer = ($data: Prism<any>) => ({
  machineIdentifier: $data.get('machineIdentifier').value,
});

const toStatus = ($data: Prism<any>) => ({
  failureCode: $data.get('failureCode').value,
  failure: $data.get('failure').value,
  state: $data.get('state').value,
  itemsCount: $data.get('itemsCount').value,
  itemsCompleteCount: $data.get('itemsCompleteCount').value,
  totalSize: $data.get('totalSize').value,
  itemsDownloadedCount: $data.get('itemsDownloadedCount').value,
  itemsReadyCount: $data.get('itemsReadyCount').value,
  itemsSuccessfulCount: $data.get('itemsSuccessfulCount').value,
});

const toMediaSettings = ($data: Prism<any>) => ({
  audioBoost: $data.get('audioBoost').value,
  maxVideoBitrate: $data.get('maxVideoBitrate').value,
  musicBitrate: $data.get('musicBitrate').value,
  photoQuality: $data.get('photoQuality').value,
  photoResolution: $data.get('photoResolution').value,
  subtitleSize: $data.get('subtitleSize').value,
  videoQuality: $data.get('videoQuality').value,
  videoResolution: $data.get('videoResolution').value,
});

const toPolicy = ($data: Prism<any>) => ({
  scope: $data.get('scope').value,
  unwatched: $data.get('unwatched').value,
});

const toLocation = ($data: Prism<any>) => ({
  uri: $data.get('uri').value,
});

const toSyncItem = ($data: Prism<any>) => {
  const $prop = $data.get('$');

  return {
    id: $prop.get('id').value,
    version: $prop.get('version').value,
    rootTitle: $prop.get('rootTitle').value,
    title: $prop.get('title').value,
    metadataType: $prop.get('metadataType').value,
    contentType: $prop.get('contentType').value,

    server: $data
      .get('Server')
      .get(0)
      .get('$')
      .transform(toServer).value,
    status: $data
      .get('Status')
      .get(0)
      .get('$')
      .transform(toStatus).value,
    mediaSettings: $data
      .get('MediaSettings')
      .get(0)
      .get('$')
      .transform(toMediaSettings).value,
    policy: $data
      .get('Policy')
      .get(0)
      .get('$')
      .transform(toPolicy).value,
    location: $data
      .get('Location')
      .get(0)
      .get('$')
      .transform(toLocation).value,
  };
};

const toSyncList = ($data: Prism<any>) => {
  if ($data.has('SyncList')) {
    // eslint-disable-next-line no-param-reassign
    $data = $data.get('SyncList');
  }

  return {
    ...$data.get('$').transform(toMediaContainer).value,

    _type: 'syncList',

    device: $data
      .get('Device')
      .get(0)
      .transform(toDevice),
    syncItems: $data
      .get('SyncItems')
      .get(0)
      .get('SyncItem')
      .toArray()
      .map(toSyncItem),
  };
};

const parseSyncList = createParser('syncList', toSyncList);

// eslint-disable-next-line import/prefer-default-export
export { parseSyncList };
