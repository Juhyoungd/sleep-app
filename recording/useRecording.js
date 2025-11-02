import { useRef, useState } from "react";
import { Audio } from "expo-av";

export function useRecording() {
  const recRef = useRef(null);
  const [uri, setUri] = useState(null);

  async function start() {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
    recRef.current = recording;
    setUri(null);
  }

  async function stop() {
    const r = recRef.current;
    if (!r) return null;
    try {
      await r.stopAndUnloadAsync();
    } catch (e) {}
    const fileUri = r.getURI();
    setUri(fileUri || null);
    recRef.current = null;
    return fileUri || null;
  }

  return { start, stop, uri };
}
