import { api } from "./client";

// 세션 생성 (녹음 시작)
export async function createSession(startedAt) {
  const form = new FormData();
  if (startedAt) form.append("started_at", startedAt);
  const { data } = await api.post("/sessions", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.id;
}

// 클립 업로드 (파일 직접 업로드)
export async function uploadClip({ sessionId, fileUri, startSec, endSec, confidence, filename, mime }) {
  const name = filename || fileUri.split("/").pop() || "clip.m4a";
  const type =
    mime ||
    (name.endsWith(".wav")
      ? "audio/wav"
      : name.endsWith(".mp3")
      ? "audio/mpeg"
      : "audio/m4a");

  const form = new FormData();
  form.append("start_sec", String(startSec));
  form.append("end_sec", String(endSec));
  if (confidence !== undefined) form.append("confidence", String(confidence));
  form.append("file", { uri: fileUri, name, type });

  const { data } = await api.post(`/sessions/${sessionId}/clips/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// 세션 종료
export async function finalizeSession(sessionId, body) {
  const { data } = await api.post(`/sessions/${sessionId}/finalize`, body);
  return data;
}

export async function getSession(sessionId) {
  const { data } = await api.get(`/sessions/${sessionId}`);
  return data;
}

export async function listByDate(ymd) {
  const { data } = await api.get("/sessions", { params: { date: ymd } });
  return data;
}

export async function deleteSession(sessionId) {
  await api.delete(`/sessions/${sessionId}`);
}

export async function deleteClip(sessionId, clipId) {
  await api.delete(`/sessions/${sessionId}/clips/${clipId}`);
}

export async function calendarSummary(from, to) {
  const { data } = await api.get("/calendar/summary", { params: { from, to } });
  return data;
}
