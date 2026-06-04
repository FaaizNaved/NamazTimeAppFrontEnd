import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';

export const ADHAN_SOUND_FILES = {
  default: require('../../assets/audio/azan_default.mp3'),
  fajr: require('../../assets/audio/azan_fajr.mp3'),
} as const;

let sound: Audio.Sound | null = null;
let playingPrayer: string | null = null;

export async function configureAudioMode() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: false,
    playThroughEarpieceAndroid: false,
    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
  });
}

function resolveSoundKey(prayerOrSound?: string): keyof typeof ADHAN_SOUND_FILES {
  const value = (prayerOrSound ?? '').toLowerCase();
  if (value.includes('fajr') || value.includes('azan_fajr')) {
    return 'fajr';
  }
  return 'default';
}

export async function playAdhan(
  prayerOrSound?: string,
  volumePercent = 80
): Promise<void> {
  await configureAudioMode();
  await stopAdhan();

  const soundKey = resolveSoundKey(prayerOrSound);
  const { sound: newSound } = await Audio.Sound.createAsync(
    ADHAN_SOUND_FILES[soundKey],
    {
      shouldPlay: true,
      volume: Math.min(1, Math.max(0, volumePercent / 100)),
      isLooping: false,
    }
  );

  sound = newSound;
  playingPrayer = prayerOrSound ?? soundKey;

  newSound.setOnPlaybackStatusUpdate((status) => {
    if (status.isLoaded && status.didJustFinish) {
      void stopAdhan();
    }
  });
}

export async function stopAdhan(): Promise<void> {
  if (sound) {
    try {
      await sound.stopAsync();
      await sound.unloadAsync();
    } catch {
      // already stopped
    }
    sound = null;
  }
  playingPrayer = null;
}

export function isAdhanPlaying(): boolean {
  return sound !== null;
}

export function getPlayingPrayer(): string | null {
  return playingPrayer;
}
