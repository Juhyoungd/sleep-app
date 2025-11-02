import React, { useRef, useState } from "react";
import { View, Text, Button, Alert } from "react-native";
import { useRecording } from "../recording/useRecording";
import { createSession, uploadClip, finalizeSession } from "../api/sessions";

export default function RecordScreen() {
  const { start, stop, uri } = useRecording();
  const sessionIdRef = useRef(null);
  const [startedAt, setStartedAt] = useState(null);

  const onStart = async () => {
    const now = new Date().toISOString();
    const id = await createSession(now);
    sessionIdRef.current = id;
    setStartedAt(now);
    await start();
  };

  const onStop = async () => {
    const fileUri = await stop();
    if (!fileUri) {
      Alert.alert("녹음 파일 없음");
      return;
    }
    const sid = sessionIdRef.current;
    await uploadClip({
      sessionId: sid,
      fileUri,
      startSec: 10,
      endSec: 15,
      confidence: 85,
      filename: "clip.m4a",
      mime: "audio/m4a",
    });

    const res = await finalizeSession(sid, {
      started_at: startedAt,
      ended_at: new Date().toISOString(),
    });

    Alert.alert(
      res.has_snore ? `코골이 ${res.snore_count}회` : "코골이 없음",
      res.advice
    );
  };

  return (
    <View style={{ padding: 20, gap: 10 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>수면 녹음</Text>
      <Button title="녹음 시작" onPress={onStart} />
      <Button title="녹음 중지 및 분석" onPress={onStop} />
      <Text>파일: {uri || "-"}</Text>
    </View>
  );
}
