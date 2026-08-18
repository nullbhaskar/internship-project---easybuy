// Professional E-Commerce Greeting Openers

export const PROFESSIONAL_OPENERS = [
  "👋 Welcome back,",
  "✨ Hello,",
  "🛍️ Discover today,",
  "🌟 Welcome,",
  "💎 Curated for",
  "⚡ Special picks for",
  "🎯 Handpicked for",
];

export function getRandomOpener(): string {
  const now = new Date();
  const hour = now.getHours();

  if (hour >= 4 && hour < 12) {
    return "☀️ Good morning,";
  } else if (hour >= 12 && hour < 16) {
    return "🌤️ Good afternoon,";
  } else if (hour >= 16 && hour < 22) {
    return "🌇 Good evening,";
  }

  return "✨ Welcome back,";
}
