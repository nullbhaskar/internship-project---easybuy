export interface WelcomeGreetingContext {
  userName?: string;
  isNewUser?: boolean;
  weather?: 'rain' | 'hot' | 'cold' | 'pleasant';
  campaign?: 'flash' | 'daily' | 'weekend' | 'festival' | 'end-season' | 'new-arrivals' | 'limited' | 'none';
  recentCategory?: string;
  wishlistCount?: number;
  hasRecentOrders?: boolean;
}

// ─── APPLE-LEVEL PREMIUM DYNAMIC WELCOME MESSAGE LIBRARY ───
// Large collection of copy templates following mature, elegant, and minimal tone
const GREETINGS_DB = {
  festivals: {
    diwali: [
      (name: string) => `Wishing you a peaceful Diwali, ${name}. Celebrate today with our select fruit combinations.`,
      (name: string) => `Happy Diwali, ${name}. Bring brightness and fresh abundance to your home.`,
    ],
    christmas: [
      (name: string) => `${name}, wishing you a warm and quiet Christmas. Explore today's special collection.`,
      (name: string) => `Merry Christmas, ${name}. Start the festive morning with a refreshing choice.`,
    ],
    holi: [
      (name: string) => `Wishing you a joyful Holi, ${name}. Bringing fresh colors to your table today.`,
      (name: string) => `Happy Holi, ${name}. Refresh your celebrations with our seasonal selections.`,
    ],
    newyear: [
      (name: string) => `Happy New Year, ${name}. Start the year fresh with our seasonal harvest.`,
      (name: string) => `Wishing you a fresh start this New Year, ${name}. Discover what is new today.`,
    ],
    valentines: [
      (name: string) => `${name}, share something sweet today. Explore our Valentine fruit pairings.`,
      (name: string) => `Celebrate today with someone special, ${name}. Discover our signature sweet selections.`,
    ],
    national: [
      (name: string) => `${name}, celebrating our national heritage today. Explore local organic harvests.`,
      (name: string) => `Honoring the day, ${name}. Discover select seasonal fruits from local farms.`,
    ],
    eid: [
      (name: string) => `Eid Mubarak, ${name}. Wishing you peace, wellness, and abundance today.`,
      (name: string) => `Celebrate Eid with loved ones, ${name}. Explore today's premium selections.`,
    ],
    navratri: [
      (name: string) => `${name}, wishing you auspicious Navratri days. Explore our pure fasting fruits.`,
      (name: string) => `A pious Navratri to you, ${name}. View our fresh, clean fasting options.`,
    ],
    pongal: [
      (name: string) => `Happy Pongal, ${name}. Celebrating a fresh harvest season with you today.`,
      (name: string) => `Wishing you a bountiful Makar Sankranti, ${name}. Enjoy the fresh harvest.`,
    ],
    rakshabandhan: [
      (name: string) => `Happy Raksha Bandhan, ${name}. Celebrate the bond with our special sweets.`,
      (name: string) => `Wishing you a joyous Raksha Bandhan, ${name}. Share love and fresh fruits.`,
    ],
    onam: [
      (name: string) => `Happy Onam, ${name}. Wishing you a season of happiness and a bountiful harvest.`,
      (name: string) => `Wishing you a prosperous Onam, ${name}. Celebrate with our premium collections.`,
    ],
  },
  campaigns: {
    flash: [
      (name: string) => `${name}, today's limited flash values are now active. Explore special pricing.`,
      (name: string) => `A quick update, ${name}: select flash drops are now live for a brief window.`,
    ],
    daily: [
      (name: string) => `${name}, today's selections are refreshed. Discover daily pricing changes.`,
      (name: string) => `Explore daily curated fresh arrivals, ${name}. Replaced and updated morning.`,
    ],
    weekend: [
      (name: string) => `${name}, weekend selections are active. Explore special price drops.`,
      (name: string) => `Your weekend starts here, ${name}. Discover our premium weekend arrangements.`,
    ],
    festival: [
      (name: string) => `${name}, the festival collection is open. View today's recommendations.`,
      (name: string) => `Add a festive touch to your table, ${name}. Explore today's premium combos.`,
    ],
    'end-season': [
      (name: string) => `${name}, end of season values are active. Refresh your catalog today.`,
      (name: string) => `Final season offerings, ${name}. Grasp the remaining harvests.`,
    ],
    'new-arrivals': [
      (name: string) => `Explore our freshly arrived selections today, ${name}.`,
      (name: string) => `New items added this morning, ${name}. Be the first to try.`,
    ],
  },
  personalized: {
    new: [
      (name: string) => `Welcome to EasyBuy, ${name}. Let's find your first fresh selection.`,
      (name: string) => `Hello ${name}. Welcome to a simpler way to shop fresh.`,
    ],
    returning: [
      (name: string) => `Welcome back, ${name}. What can we find for you today?`,
      (name: string) => `Good to see you again, ${name}. Your usual favorites are ready.`,
    ],
    wishlist: [
      (name: string) => `${name}, items in your wishlist have been refreshed. View updates.`,
      (name: string) => `An item you saved is currently high in stock, ${name}. View details.`,
    ],
    recent: (category: string) => [
      (name: string) => `${name}, we updated our ${category} list. Explore recommendations.`,
      (name: string) => `Interested in ${category}? View our latest additions, ${name}.`,
    ],
  },
  weather: {
    rain: [
      (name: string) => `Staying inside today, ${name}? Let us bring the freshness to you.`,
      (name: string) => `Quiet rainy day, ${name}. Find everything you need right here.`,
    ],
    hot: [
      (name: string) => `Stay cool today, ${name}. Explore our refreshing cold combos.`,
      (name: string) => `Beat the heat, ${name}. Refreshing summer choices await.`,
    ],
    cold: [
      (name: string) => `Stay warm today, ${name}. Fuel your day with seasonal selections.`,
      (name: string) => `Cold morning, ${name}. Keep healthy with vitamin-rich choices.`,
    ],
    pleasant: [
      (name: string) => `It is a beautiful day, ${name}. What shall we find for you?`,
      (name: string) => `Enjoying the pleasant weather, ${name}? Explore today's picks.`,
    ],
  },
  days: {
    monday: [
      (name: string) => `A fresh week starts today, ${name}. Set your goals with a healthy start.`,
      (name: string) => `Good morning, ${name}. Let's make this week a fresh start.`,
    ],
    friday: [
      (name: string) => `The weekend is almost here, ${name}. Finish the week strong.`,
      (name: string) => `Unwind after a busy week, ${name}. Explore Friday specials.`,
    ],
    saturday: [
      (name: string) => `${name}, your Saturday starts here. Explore today's pairings.`,
      (name: string) => `A quiet Saturday morning, ${name}. Slow down and enjoy the day.`,
    ],
    sunday: [
      (name: string) => `A slow, relaxed Sunday, ${name}. Take time to refresh today.`,
      (name: string) => `Sundays are for resting, ${name}. Let us handle your needs today.`,
    ],
    midweek: [
      (name: string) => `${name}, let's make this day productive. Discover fresh choices.`,
      (name: string) => `Middle of the week, ${name}. Keep your energy high with our fresh picks.`,
    ],
  },
  times: {
    earlyMorning: [
      (name: string) => `Good morning, ${name}. Start your day with a fresh, quiet selection.`,
      (name: string) => `Early morning quiet, ${name}. Let's prepare for the day ahead.`,
    ],
    morning: [
      (name: string) => `Good morning, ${name}. What can we find for you today?`,
      (name: string) => `Good morning, ${name}. Start your day with a healthy choice.`,
    ],
    afternoon: [
      (name: string) => `Good afternoon, ${name}. Take a refreshing break with us.`,
      (name: string) => `Good afternoon, ${name}. Refresh your day with today's picks.`,
    ],
    evening: [
      (name: string) => `Good evening, ${name}. Unwind with today's selections.`,
      (name: string) => `Good evening, ${name}. What are you looking for tonight?`,
    ],
    night: [
      (name: string) => `${name}, looking for something before the day ends?`,
      (name: string) => `Quiet night in, ${name}. Explore what is available.`,
    ],
    lateNight: [
      (name: string) => `Up late, ${name}? Let us help you find what you need.`,
      (name: string) => `Late night thoughts, ${name}. Browse our quiet hours catalog.`,
    ],
  },
  fallback: [
    (name: string) => `Hello ${name}. Discover fresh, healthy choices curated for you.`,
    (name: string) => `What can we find for you today, ${name}?`,
  ],
};

// ─── PRIORITY ENGINE DETERMINATION ───
export function getDynamicWelcomeMessage(
  userName: string = 'Bhaskar',
  context: WelcomeGreetingContext = {}
): string {
  const name = userName || 'Bhaskar';
  const now = new Date();
  const month = now.getMonth(); // 0-11
  const date = now.getDate(); // 1-31
  const day = now.getDay(); // 0 (Sun) - 6 (Sat)
  const hour = now.getHours();

  // 1. Calendar / Special Event check (Diwali, Holi, Christmas, etc.)
  if (month === 10 && date >= 5 && date <= 12) {
    return selectRandomCopy(GREETINGS_DB.festivals.diwali, name);
  }
  if (month === 11 && date === 25) {
    return selectRandomCopy(GREETINGS_DB.festivals.christmas, name);
  }
  if (month === 2 && date >= 10 && date <= 16) {
    return selectRandomCopy(GREETINGS_DB.festivals.holi, name);
  }
  if (month === 0 && date === 1) {
    return selectRandomCopy(GREETINGS_DB.festivals.newyear, name);
  }
  if (month === 1 && date === 14) {
    return selectRandomCopy(GREETINGS_DB.festivals.valentines, name);
  }
  if ((month === 0 && date === 26) || (month === 7 && date === 15)) {
    return selectRandomCopy(GREETINGS_DB.festivals.national, name);
  }
  if (month === 7 && date === 28) {
    return selectRandomCopy(GREETINGS_DB.festivals.rakshabandhan, name); // Raksha bandhan (Aug 28 2026)
  }
  if (month === 7 && date === 26) {
    return selectRandomCopy(GREETINGS_DB.festivals.onam, name); // Onam (Aug 26 2026)
  }
  if (month === 9 && date >= 12 && date <= 22) {
    return selectRandomCopy(GREETINGS_DB.festivals.navratri, name);
  }
  if (month === 0 && date === 14) {
    return selectRandomCopy(GREETINGS_DB.festivals.pongal, name);
  }

  // 2. Shopping Campaign check
  if (context.campaign && context.campaign !== 'none') {
    const list = GREETINGS_DB.campaigns[context.campaign as keyof typeof GREETINGS_DB.campaigns];
    if (list) {
      return selectRandomCopy(list, name);
    }
  }

  // 3. Personalized Context check
  if (context.wishlistCount && context.wishlistCount > 0) {
    return selectRandomCopy(GREETINGS_DB.personalized.wishlist, name);
  }
  if (context.recentCategory) {
    const templates = GREETINGS_DB.personalized.recent(context.recentCategory);
    return selectRandomCopy(templates, name);
  }
  if (context.isNewUser) {
    return selectRandomCopy(GREETINGS_DB.personalized.new, name);
  }

  // 4. Weather Context check
  if (context.weather && context.weather !== 'pleasant') {
    const list = GREETINGS_DB.weather[context.weather];
    if (list) {
      return selectRandomCopy(list, name);
    }
  }

  // 1. Time of day check (Ensures evening/afternoon/morning greetings match real local time!)
  if (hour >= 16 && hour < 21) {
    // 4:00 PM to 9:00 PM -> Evening
    return selectRandomCopy([
      (name: string) => `Good evening, ${name}. Unwind with today's selections.`,
      (name: string) => `Good evening, ${name}. What are you looking for tonight?`,
      (name: string) => `Good evening, ${name}. Let's make this week a fresh start.`,
      (name: string) => `Hope you are having a pleasant evening, ${name}.`,
    ], name);
  }

  if (hour >= 12 && hour < 16) {
    // 12:00 PM to 4:00 PM -> Afternoon
    return selectRandomCopy([
      (name: string) => `Good afternoon, ${name}. Take a refreshing break with us.`,
      (name: string) => `Good afternoon, ${name}. Refresh your day with today's picks.`,
      (name: string) => `Good afternoon, ${name}. Let's make today productive.`,
    ], name);
  }

  if (hour >= 21 || hour < 4) {
    // 9:00 PM to 4:00 AM -> Night / Late Night
    return selectRandomCopy([
      (name: string) => `Good evening, ${name}. Looking for something before the day ends?`,
      (name: string) => `Quiet night in, ${name}. Explore what is available.`,
      (name: string) => `Up late, ${name}? Let us help you find what you need.`,
    ], name);
  }

  if (hour >= 4 && hour < 7) {
    return selectRandomCopy(GREETINGS_DB.times.earlyMorning, name);
  }

  if (hour >= 7 && hour < 12) {
    return selectRandomCopy(GREETINGS_DB.times.morning, name);
  }

  // 2. Day of the week check (Monday, Friday, Saturday, Sunday)
  if (day === 1) {
    return selectRandomCopy([
      (name: string) => `A fresh week starts today, ${name}. Set your goals with a healthy start.`,
      (name: string) => `Good morning, ${name}. Let's make this week a fresh start.`,
    ], name);
  }
  if (day === 5) {
    return selectRandomCopy(GREETINGS_DB.days.friday, name);
  }
  if (day === 6) {
    return selectRandomCopy(GREETINGS_DB.days.saturday, name);
  }
  if (day === 0) {
    return selectRandomCopy(GREETINGS_DB.days.sunday, name);
  }

  // 3. Fallback copy
  return selectRandomCopy(GREETINGS_DB.fallback, name);
}

function selectRandomCopy(list: Array<(name: string) => string>, name: string): string {
  const index = Math.floor(Math.random() * list.length);
  return list[index](name);
}
