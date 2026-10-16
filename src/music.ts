/* =============================================================================
 * SimEarth 2.0 — background music
 * -----------------------------------------------------------------------------
 * One looping track per scene (title screen, main game), played through an
 * <audio> element: over file:// browsers refuse fetch() and so WebAudio's
 * decodeAudioData, but a plain media element loads local files fine.
 * ========================================================================== */

namespace SE {
  export type MusicScene = 'title' | 'game';

  /** Track per scene: a file name in assets/audio/music/ without ".mp3". */
  export const MUSIC_TRACKS: Readonly<Record<MusicScene, string>> = {
    title: 'lumiere-du-matin',
    game: 'lumiere-du-matin',
  };

  /** Below the chime and effects, so the music stays in the background. */
  const MUSIC_VOLUME = 0.45;
  const MUSIC_FADE_MS = 1200;

  export class MusicPlayer {
    private readonly audio = new Audio();
    private track = '';
    private enabled: boolean;
    private fadeTimer = 0;

    constructor(enabled: boolean) {
      this.enabled = enabled;
      this.audio.loop = true;
      this.audio.preload = 'auto';
      this.audio.volume = 0;
      // Autoplay is blocked until the player has touched the page: retry on the first gesture.
      const unlock = (): void => {
        if (!this.audio.paused || !this.wantsSound()) return;
        this.resume();
      };
      for (const type of ['pointerdown', 'keydown']) document.addEventListener(type, unlock, { capture: true });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) this.audio.pause();
        else if (this.wantsSound()) this.resume();
      });
    }

    /** Switch to a scene's track; the same track simply keeps playing. */
    play(scene: MusicScene): void {
      const track = MUSIC_TRACKS[scene];
      if (track !== this.track) {
        this.track = track;
        this.audio.src = `assets/audio/music/${track}.mp3`;
        this.audio.volume = 0;
      }
      if (this.enabled) this.resume();
    }

    setEnabled(on: boolean): void {
      this.enabled = on;
      if (on) this.resume();
      else this.fadeTo(0, () => this.audio.pause());
    }

    private wantsSound(): boolean {
      return this.enabled && this.track !== '' && !document.hidden;
    }

    private resume(): void {
      const started = this.audio.play();
      // Rejected while autoplay is still blocked or the file is missing: the game runs silent.
      started.then(() => this.fadeTo(MUSIC_VOLUME), () => undefined);
    }

    private fadeTo(target: number, done?: () => void): void {
      window.clearInterval(this.fadeTimer);
      const from = this.audio.volume;
      const start = performance.now();
      this.fadeTimer = window.setInterval(() => {
        const t = Math.min(1, (performance.now() - start) / MUSIC_FADE_MS);
        this.audio.volume = from + (target - from) * t;
        if (t < 1) return;
        window.clearInterval(this.fadeTimer);
        done?.();
      }, 50);
    }
  }
}
