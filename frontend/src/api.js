const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function generateResume(formData, onChunk, onDone) {
  const response = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!response.ok) throw new Error("Failed to generate resume");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value));
  }

  onDone();
}
export async function sendChatMessage(messages, onChunk, onDone) {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) throw new Error("Chat failed");

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onChunk(decoder.decode(value));
  }

  onDone();
}

export async function downloadResumePDF(formData) {
  const newTab = window.open("", "_blank");
  if (!newTab) {
    alert("Please allow popups for this site to download your PDF.");
    return;
  }

  newTab.document.write("<p style='font-family:sans-serif;padding:2rem'>Generating your PDF, please wait...</p>");

  const response = await fetch(`${BASE_URL}/generate-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  if (!response.ok) {
    newTab.close();
    throw new Error("Failed to generate PDF");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  newTab.location.href = url;
}