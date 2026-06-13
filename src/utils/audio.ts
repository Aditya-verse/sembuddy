import { Howler, Howl } from 'howler';
import { useSettingsStore } from '../stores/settingsStore';

export interface AudioClip {
  id: string;
  path: string;
  volume?: number;
  sprite?: Record<string, [number, number]>;
}

class AudioManager {
  private static instance: AudioManager;
  private sounds: Map<string, Howl> = new Map();
  private currentBGM: string | null = null;

  private constructor() {
    Howler.autoUnlock = true;
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  loadSound(id: string, path: string, options?: {
    volume?: number;
    loop?: boolean;
    sprite?: Record<string, [number, number]>;
  }): Howl {
    if (this.sounds.has(id)) {
      return this.sounds.get(id)!;
    }

    const settings = useSettingsStore.getState();
    const volume = (options?.volume ?? 1) * (settings.sfxVolume / 100);

    const howl = new Howl({
      src: [path],
      volume,
      loop: options?.loop ?? false,
      sprite: options?.sprite,
      onload: () => {
        console.log(`Audio loaded: ${id}`);
      },
      onerror: (err) => {
        console.error(`Failed to load audio ${id}:`, err);
      },
    });

    this.sounds.set(id, howl);
    return howl;
  }

  play(id: string, spriteId?: string): number {
    const sound = this.sounds.get(id);
    if (!sound) {
      console.warn(`Sound not found: ${id}`);
      return 0;
    }

    const settings = useSettingsStore.getState();
    sound.volume((settings.masterVolume / 100) * (settings.sfxVolume / 100));

    if (spriteId && sound._sprite && sound._sprite[spriteId]) {
      return sound.play(spriteId);
    }

    return sound.play();
  }

  playVoice(id: string, spriteId?: string): number {
    const sound = this.sounds.get(id);
    if (!sound) {
      console.warn(`Voice not found: ${id}`);
      return 0;
    }

    const settings = useSettingsStore.getState();
    sound.volume((settings.masterVolume / 100) * (settings.voiceVolume / 100));

    if (spriteId && sound._sprite && sound._sprite[spriteId]) {
      return sound.play(spriteId);
    }

    return sound.play();
  }

  pause(id: string): void {
    const sound = this.sounds.get(id);
    if (sound) sound.pause();
  }

  stop(id: string): void {
    const sound = this.sounds.get(id);
    if (sound) sound.stop();
  }

  setVolume(id: string, volume: number): void {
    const sound = this.sounds.get(id);
    if (sound) sound.volume(Math.min(1, Math.max(0, volume)));
  }

  playBGM(id: string, fadeIn: boolean = true): void {
    if (this.currentBGM && this.currentBGM !== id) {
      this.stop(this.currentBGM);
    }

    const sound = this.sounds.get(id);
    if (!sound) {
      console.warn(`BGM not found: ${id}`);
      return;
    }

    sound.loop(true);
    const settings = useSettingsStore.getState();
    sound.volume(settings.masterVolume / 100 * 0.5); // BGM at 50% of master volume

    if (fadeIn) {
      sound.fade(0, settings.masterVolume / 100 * 0.5, 1000);
    }

    sound.play();
    this.currentBGM = id;
  }

  stopBGM(fadeOut: boolean = true): void {
    if (!this.currentBGM) return;

    const sound = this.sounds.get(this.currentBGM);
    if (!sound) return;

    if (fadeOut) {
      sound.fade(sound.volume(), 0, 1000, () => {
        sound.stop();
      });
    } else {
      sound.stop();
    }

    this.currentBGM = null;
  }

  isPlaying(id: string): boolean {
    const sound = this.sounds.get(id);
    return sound ? sound.playing() : false;
  }

  getDuration(id: string): number {
    const sound = this.sounds.get(id);
    return sound ? sound.duration() : 0;
  }

  unload(id: string): void {
    const sound = this.sounds.get(id);
    if (sound) {
      sound.unload();
      this.sounds.delete(id);
    }
  }

  unloadAll(): void {
    this.sounds.forEach(sound => sound.unload());
    this.sounds.clear();
  }
}

export const audioManager = AudioManager.getInstance();
