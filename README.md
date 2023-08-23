# Hex Music Player

Music client for Plex Media Server.

## Setup
1. Install, login to Plex through your browser, and select your server and music library.
2. *Optional* Some additional track and genre information requires access to the last.fm API. If you want to use this, get a personal last.fm [API key](https://www.last.fm/api/account/create) and copy and paste it in settings.

## Tips
- You must login as a server administrator, since some metadata that Hex requests is only available to the administrator (e.g., playback history information). Authentication information (token and server name) is saved locally in Roaming/Hex Music Playing.
- Hold <kbd>Control</kbd> to see additional options in some views.
- Artist banners are loaded from the Plex artist "background" metadata field. They can be added via dragging and dropping an image file onto the banner space.
- Initial playback may take a few seconds since the audio API has to completely load the track before playback can begin. The upcoming track is preloaded for gapless playback.
- Lyrics are loaded from a public API and can be edited on the track details page. LRC files can be dragged into the text box. Lyrics are saved as JSON files in the Roaming/Hex Music Player folder.
- In order to fully populate the "Appears On" section, the application executes a broad search for any track that contains the given artist name as a string in its metadata. Occassionally, if an artist's name is a substring of another artist (e.g., "Selena" & "Selena Gomez"), erroneous results will be returned. These results can be hidden by right-clicking on the album and selecting "Hide album." Exclusions are saved in Roaming/Hex Music Player for future filtering. If an album is hidden erroneously, hidden albums can be restored in the artist menu under the artist banner image.

## Bugs
- Occassional errors may be encountered. Press <kbd>Control</kbd> + <kbd>R</kbd> to reload the entire application.
- <kbd>Control</kbd> + <kbd>Shift</kbd> + <kbd>I</kbd> opens the Developer Tools if you want to report information about errors encountered.
- No support for Tidal content.
- *Repeat all* currently non-functional.
- Some metadata may be gated behind Plex Pass. I believe this is mostly "Sonic Similar" content (so similar tracks and artists may show no results).
- Playlist loading can be slow for large playlists. This is due to the fact that information for all tracks must be downloaded to allow for real-time filtering etc. since Plex doesn't support this on the backend.
- Some links may not be functional (the pages they direct to aren't complete at this time).

## Special thanks to these projects
> [Gapless-5](https://github.com/regosen/Gapless-5) <br/>
> [perplexed](https://github.com/stayradiated/perplexed)

## 🏷️ License
MIT © meisandrew