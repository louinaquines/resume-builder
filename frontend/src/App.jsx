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