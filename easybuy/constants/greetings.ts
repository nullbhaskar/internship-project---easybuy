import AsyncStorage from '@react-native-async-storage/async-storage';

export interface TimeGreetingPair {
  id: string;
  greeting: (name: string) => string;
  subtitle: string;
}

// 🌅 EARLY MORNING (5:00 AM – 7:59 AM)
const EARLY_MORNING_PAIRS: TimeGreetingPair[] = [
  { id: 'em1', greeting: (name) => `🌅 Rise & shine, ${name}!`, subtitle: 'New day, new deals waiting for you.' },
  { id: 'em2', greeting: (name) => `☀️ Good morning, ${name}!`, subtitle: 'Let’s make today awesome.' },
  { id: 'em3', greeting: (name) => `☕ Wakey wakey, ${name}!`, subtitle: 'Coffee first, shopping later.' },
  { id: 'em4', greeting: (name) => `✨ Fresh start, ${name}!`, subtitle: 'Your wishlist is waiting.' },
  { id: 'em5', greeting: (name) => `🚀 Ready for today, ${name}?`, subtitle: 'Early bird special offers are live.' },
];

// ☀️ MORNING (8:00 AM – 11:59 AM)
const MORNING_PAIRS: TimeGreetingPair[] = [
  { id: 'm1', greeting: (name) => `👋 Hey, ${name}!`, subtitle: 'Let’s get today rolling.' },
  { id: 'm2', greeting: (name) => `😎 Yo, ${name}!`, subtitle: 'Time to grab some deals.' },
  { id: 'm3', greeting: (name) => `✨ Morning vibes, ${name}!`, subtitle: 'Fresh drops just landed.' },
  { id: 'm4', greeting: (name) => `🙌 Good to see you, ${name}!`, subtitle: 'Your daily picks are ready.' },
  { id: 'm5', greeting: (name) => `⚡ Ready to shop, ${name}?`, subtitle: 'Best offers of the morning.' },
];

// 🌞 AFTERNOON (12:00 PM – 4:59 PM)
const AFTERNOON_PAIRS: TimeGreetingPair[] = [
  { id: 'a1', greeting: (name) => `🌞 Good afternoon, ${name}!`, subtitle: 'Hope your day’s going great.' },
  { id: 'a2', greeting: (name) => `☕ Take a break, ${name}!`, subtitle: 'Grab what you need today.' },
  { id: 'a3', greeting: (name) => `🔥 What’s next, ${name}?`, subtitle: 'Fresh offers just dropped.' },
  { id: 'a4', greeting: (name) => `✨ Ready for a win, ${name}?`, subtitle: 'Take a quick shopping break.' },
  { id: 'a5', greeting: (name) => `📦 Need anything today, ${name}?`, subtitle: 'Fast 10-15 min delivery ready.' },
];

// 🌇 EVENING (5:00 PM – 7:59 PM)
const EVENING_PAIRS: TimeGreetingPair[] = [
  { id: 'e1', greeting: (name) => `🌇 Evening, ${name}!`, subtitle: 'Time to unwind with fresh finds.' },
  { id: 'e2', greeting: (name) => `✨ Welcome back, ${name}!`, subtitle: 'Relax, we’ve got today’s best deals.' },
  { id: 'e3', greeting: (name) => `🎉 You’re back, ${name}!`, subtitle: 'Evening shopping hits different.' },
  { id: 'e4', greeting: (name) => `🌆 Evening vibes, ${name}!`, subtitle: 'Time for something new.' },
  { id: 'e5', greeting: (name) => `🎁 Treat yourself, ${name}!`, subtitle: 'Special evening price drops.' },
];

// 🌙 NIGHT (8:00 PM – 11:59 PM)
const NIGHT_PAIRS: TimeGreetingPair[] = [
  { id: 'n1', greeting: (name) => `🌙 Back again, ${name}?`, subtitle: 'Night deals are live right now.' },
  { id: 'n2', greeting: (name) => `🦉 Night owl, ${name}?`, subtitle: 'Shop before you sleep.' },
  { id: 'n3', greeting: (name) => `✨ Late-night shopping, ${name}?`, subtitle: 'Your cart misses you.' },
  { id: 'n4', greeting: (name) => ` 👀 Still awake, ${name}?`, subtitle: 'One last scroll before bed?' },
  { id: 'n5', greeting: (name) => `🌌 Let’s find something cool, ${name}!`, subtitle: 'Midnight arrivals ready.' },
];

// 🌌 MIDNIGHT (12:00 AM – 4:59 AM)
const MIDNIGHT_PAIRS: TimeGreetingPair[] = [
  { id: 'md1', greeting: (name) => `🌌 Burning the midnight oil, ${name}?`, subtitle: 'You’re one of the night crew.' },
  { id: 'md2', greeting: (name) => `👀 You’re up late, ${name}!`, subtitle: 'Quiet hours, better deals.' },
  { id: 'md3', greeting: (name) => `🧭 Midnight explorer, ${name}!`, subtitle: 'Can’t sleep? Let’s browse.' },
  { id: 'md4', greeting: (name) => `🌙 Can’t sleep, ${name}?`, subtitle: 'Midnight finds hit differently.' },
  { id: 'md5', greeting: (name) => `🔋 Night mode activated, ${name}!`, subtitle: 'Secret late night drops.' },
];

const LAST_GREETING_KEY = 'easybuy_last_greeting_id';

export async function getHumanTimeGreeting(userName: string = 'Bhaskar'): Promise<{ greeting: string; subtitle: string; id: string }> {
  // Determine current Indian Time (IST) hour (0 - 23)
  const now = new Date();
  const hour = now.getHours();

  let currentSlotPairs: TimeGreetingPair[] = MORNING_PAIRS;

  if (hour >= 5 && hour < 8) {
    currentSlotPairs = EARLY_MORNING_PAIRS;
  } else if (hour >= 8 && hour < 12) {
    currentSlotPairs = MORNING_PAIRS;
  } else if (hour >= 12 && hour < 17) {
    currentSlotPairs = AFTERNOON_PAIRS;
  } else if (hour >= 17 && hour < 20) {
    currentSlotPairs = EVENING_PAIRS;
  } else if (hour >= 20 && hour <= 23) {
    currentSlotPairs = NIGHT_PAIRS;
  } else {
    // 00:00 to 04:59
    currentSlotPairs = MIDNIGHT_PAIRS;
  }

  let lastId = '';
  try {
    lastId = (await AsyncStorage.getItem(LAST_GREETING_KEY)) || '';
  } catch (e) {
    console.log('Error reading last greeting ID:', e);
  }

  // Filter out last shown ID to prevent consecutive repeats
  const availablePairs = currentSlotPairs.filter((p) => p.id !== lastId);
  const pool = availablePairs.length > 0 ? availablePairs : currentSlotPairs;

  const chosen = pool[Math.floor(Math.random() * pool.length)];

  try {
    await AsyncStorage.setItem(LAST_GREETING_KEY, chosen.id);
  } catch (e) {
    console.log('Error saving last greeting ID:', e);
  }

  return {
    greeting: chosen.greeting(userName),
    subtitle: chosen.subtitle,
    id: chosen.id,
  };
}
