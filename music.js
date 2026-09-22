(function (root) {
  'use strict';
  const tracks = {
    minor: {
      sweet: { title: 'きみと、ひかりの中へ', src: 'assets/ending-minor-sweet.mp3' },
      promise: { title: '窓際の約束', src: 'assets/ending-minor-promise.mp3' },
      buddy: { title: 'ふたりの帰り道', src: 'assets/ending-minor-buddy.mp3' }
    },
    adult: {
      sweet: { title: '名前で呼べる春', src: 'assets/ending-adult-sweet.mp3' },
      promise: { title: '未送信の余白', src: 'assets/ending-adult-promise.mp3' },
      buddy: { title: '恋を、栞にして', src: 'assets/ending-adult-buddy.mp3' }
    }
  };
  function createPlayer(audio, onChange = () => {}, onError = () => {}) {
    let track = null, enabled = false, visible = true, revision = 0;
    audio.loop = true; audio.preload = 'none'; audio.volume = .48;
    const active = () => Boolean(track && enabled && visible);
    const report = () => onChange({ playing: active() && !audio.paused, title: track?.title || '' });
    audio.addEventListener('playing', report); audio.addEventListener('pause', report);
    return {
      set(nextTrack, nextEnabled, nextVisible = true) {
        const changed = nextTrack?.src !== track?.src;
        if (!changed && enabled === nextEnabled && visible === nextVisible) return;
        const ticket = ++revision;
        enabled = nextEnabled; visible = nextVisible; track = nextTrack;
        if (changed) {
          audio.pause();
          if (track) audio.src = track.src;
          else audio.removeAttribute('src');
          audio.load();
        }
        if (!active()) { audio.pause(); report(); return; }
        report();
        Promise.resolve(audio.play()).then(() => {
          if (ticket !== revision) return;
          if (!active()) audio.pause();
          report();
        }).catch(error => {
          if (ticket !== revision || !active() || error?.name === 'AbortError') return;
          audio.pause(); onError(error); report();
        });
      }
    };
  }
  const api = { tracks, createPlayer };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BunriMusic = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
