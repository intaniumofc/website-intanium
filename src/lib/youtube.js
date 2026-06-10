const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export function extractYouTubeVideoId(input) {
  const value = input?.trim();
  if (!value) return null;
  if (YOUTUBE_ID_PATTERN.test(value)) return value;

  const normalizedUrl = value.startsWith('http://') || value.startsWith('https://')
    ? value
    : `https://${value}`;

  try {
    const url = new URL(normalizedUrl);
    const hostname = url.hostname.replace(/^www\./, '').replace(/^m\./, '');

    if (hostname === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return YOUTUBE_ID_PATTERN.test(id) ? id : null;
    }

    if (hostname === 'youtube.com' || hostname === 'youtube-nocookie.com') {
      const queryId = url.searchParams.get('v');
      if (YOUTUBE_ID_PATTERN.test(queryId)) return queryId;

      const segments = url.pathname.split('/').filter(Boolean);
      if (['shorts', 'embed', 'live'].includes(segments[0]) && YOUTUBE_ID_PATTERN.test(segments[1])) {
        return segments[1];
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function getYouTubeWatchUrl(videoId) {
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : '';
}

export function getYouTubeThumbnailUrl(videoId) {
  return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
}

export function formatYouTubeDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  const parts = hours > 0 ? [hours, minutes, remainingSeconds] : [minutes, remainingSeconds];
  return parts.map(part => String(part).padStart(2, '0')).join(':');
}

let youtubeApiPromise;

function loadYouTubeIframeApi() {
  if (typeof window === 'undefined') return Promise.reject(new Error('YouTube API hanya tersedia di browser.'));
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousReadyHandler = window.onYouTubeIframeAPIReady;
    const timeout = window.setTimeout(() => reject(new Error('YouTube API tidak merespons.')), 15000);

    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeout);
      previousReadyHandler?.();
      resolve(window.YT);
    };

    if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        window.clearTimeout(timeout);
        youtubeApiPromise = undefined;
        reject(new Error('Gagal memuat YouTube API.'));
      };
      document.head.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

export async function getYouTubeVideoMetadata(videoId) {
  if (!YOUTUBE_ID_PATTERN.test(videoId || '')) throw new Error('Video ID YouTube tidak valid.');

  const YT = await loadYouTubeIframeApi();

  return new Promise((resolve, reject) => {
    const target = document.createElement('div');
    target.style.position = 'fixed';
    target.style.width = '1px';
    target.style.height = '1px';
    target.style.left = '-9999px';
    target.style.top = '-9999px';
    document.body.appendChild(target);

    let player;
    let settled = false;
    const cleanup = () => {
      player?.destroy?.();
      target.remove();
    };
    const finish = (callback) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      callback();
      cleanup();
    };
    const timeout = window.setTimeout(() => {
      finish(() => reject(new Error('Metadata video tidak dapat dibaca. Pastikan video publik dan dapat diputar lewat embed.')));
    }, 15000);

    player = new YT.Player(target, {
      videoId,
      width: '1',
      height: '1',
      playerVars: { controls: 0, playsinline: 1 },
      events: {
        onReady: event => {
          const readMetadata = (attempt = 0) => {
            const title = event.target.getVideoData()?.title?.trim();
            const durationSeconds = event.target.getDuration();

            if (title && durationSeconds > 0) {
              finish(() => resolve({
                title,
                duration: formatYouTubeDuration(durationSeconds),
                durationSeconds,
              }));
              return;
            }

            if (attempt < 10) {
              window.setTimeout(() => readMetadata(attempt + 1), 300);
            }
          };
          readMetadata();
        },
        onError: () => {
          finish(() => reject(new Error('Video tidak dapat dibaca. Pastikan link benar, video publik, dan embed diizinkan.')));
        },
      },
    });
  });
}
