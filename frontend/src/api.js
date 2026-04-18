const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function generateResume(formData, onChunk, onDone) {
  console.log("Sending to:", `${BASE_URL}/generate`);
  console.log("Payload:", formData);

  const response = await fetch(`${BASE_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  console.log("Response status:", response.status);
  console.log("Response ok:", response.ok);

  if (!response.ok) {
    const text = await response.text();
    console.log("Error body:", text);
    throw new Error("Failed to generate resume");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let count = 0;
  while (true) {
    const { done, value } = await reader.read();
    console.log("Read:", { done, byteLength: value?.byteLength, count: ++count });
    if (done) break;
    onChunk(decoder.decode(value));
  }

  onDone();
}