export function pollinationsImageUrl(prompt: string) {
  // Pollinations public image endpoint (client-side friendly)
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}`;
}

export async function fetchPollinations(prompt: string) {
  // Return the direct image url; callers can assign to <img src=... />
  return pollinationsImageUrl(prompt);
}
