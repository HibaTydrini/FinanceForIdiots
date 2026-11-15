export type Question = { title: string; options: string[] };

export const requiredQuestions: Question[] = [
  {
    title: "What is your investment knowledge?",
    options: ["I'm completely new to investing", "I know a little about investing", "I understand the basics", "I'm experienced with investing"],
  },
  {
    title: "What have you invested in?",
    options: ["I haven't invested yet", "Stocks", "ETFs or mutual funds", "Cryptocurrency", "Bonds or GICs", "A mix of different investments"],
  },
  {
    title: "Why do you want to invest? What are your specific goals?",
    options: ["Grow my wealth over time", "Save for a house or major purchase", "Prepare for retirement", "Generate passive income", "I'm still figuring out my goals"],
  },
  {
    title: "Imagine your investments suddenly lose 20% of their value. How would you react?",
    options: ["A. I'd panic and sell immediately.", "B. I'd feel stressed and consider selling.", "C. I'd be concerned, but I'd keep my investments.", "D. I'd stay calm and might invest more while prices are lower."],
  },
  {
    title: "How important is the money you're planning to invest for your everyday expenses?",
    options: ["A. I might need it to pay for essentials like rent or groceries.", "B. I can invest it, but losing it would affect my financial stability.", "C. It's extra money I don't expect to need anytime soon.", "D. It's disposable income, and losing it wouldn't affect my lifestyle."],
  },
  {
    title: "How much would you be comfortable investing each month?",
    options: ["Less than $50", "$50–$100", "$100–$250", "$250–$500", "$500–$1,000", "More than $1,000", "I'm not sure yet."],
  },
  {
    title: "What are you looking for from Finance For Dummies?",
    options: ["Learn how investing works", "Understand my investments", "Get personalized financial education", "Understand investment risks", "All of the above"],
  },
];

export const optionalQuestions: Question[] = [
  { title: "How stable is your current income?", options: ["Very stable — it is predictable each month", "Mostly stable — it changes a little", "Irregular — it changes significantly", "I don't currently have income"] },
  { title: "How much do you have in emergency savings?", options: ["No emergency savings yet", "Less than one month of expenses", "1–3 months of expenses", "3–6 months of expenses", "More than 6 months of expenses"] },
  { title: "When do you expect to need the money you're investing?", options: ["Within 1 year", "In 1–3 years", "In 3–5 years", "In 5–10 years", "More than 10 years from now"] },
  { title: "Do you currently have high-interest debt?", options: ["Yes, and it is difficult to manage", "Yes, but I am actively paying it down", "Only a small, manageable amount", "No high-interest debt", "I'm not sure"] },
  { title: "How involved do you want to be in managing your investments?", options: ["Keep it automatic and simple", "Check in occasionally", "Make some decisions regularly", "Research and manage investments actively"] },
  { title: "How would you handle an unexpected $1,000 expense?", options: ["I would need to borrow money", "I would use a credit card and repay it over time", "I could use savings, but it would be a strain", "My emergency fund could cover it comfortably"] },
  { title: "Do you prefer investing automatically every month or manually?", options: ["Automatically every month", "Mostly automatically, with occasional changes", "A mix of automatic and manual investing", "Manually, when I choose", "I'm not sure yet"] },
  { title: "How comfortable are you with your investments changing in value from day to day?", options: ["Very uncomfortable", "A little uncomfortable", "Generally comfortable", "Very comfortable"] },
  { title: "Would you prefer spreading your money across many investments or concentrating on a few?", options: ["Spread it across many investments", "Mostly spread out, with a few favourites", "A balanced mix", "Concentrate on a few investments", "I'm not sure yet"] },
  { title: "If your financial situation changed, how easily could you reduce or pause your investments?", options: ["I would need to pause immediately", "I could reduce them after adjusting my budget", "I could continue for a few months", "I could continue without affecting essentials", "I'm not sure"] },
];

export type OnboardingProfile = {
  requiredAnswers: string[];
  optionalAnswers: string[];
  preliminaryRisk: string;
  monthlyBudget: string;
  demoClientId: string | null;
  optionalSkipped: boolean;
};

const PENDING_KEY = "ffd:onboarding:pending";
const ACTIVE_USER_KEY = "ffd:active-user";
const userKey = (userId: string) => `ffd:onboarding:user:${userId}`;

export function estimatePreliminaryRisk(answers: string[]): string {
  const emotional = requiredQuestions[3].options.indexOf(answers[3]);
  const capacity = requiredQuestions[4].options.indexOf(answers[4]);
  const score = Math.min(Math.max(emotional, 0), Math.max(capacity, 0));
  return ["Conservative", "Cautious", "Balanced", "Growth-oriented"][score] ?? "Not enough information";
}

export function emptyProfile(): OnboardingProfile {
  return { requiredAnswers: [], optionalAnswers: [], preliminaryRisk: "Not enough information", monthlyBudget: "", demoClientId: null, optionalSkipped: false };
}

function read(key: string): OnboardingProfile | null {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? "null") as Partial<OnboardingProfile> | null;
    return parsed ? { ...emptyProfile(), ...parsed } : null;
  } catch { return null; }
}

function write(key: string, profile: OnboardingProfile) { localStorage.setItem(key, JSON.stringify(profile)); }

export function readPendingProfile() { return read(PENDING_KEY); }
export function savePendingProfile(profile: OnboardingProfile) { write(PENDING_KEY, profile); }
export function clearPendingProfile() { localStorage.removeItem(PENDING_KEY); }
export function setActiveUser(userId: string | null) {
  if (userId) sessionStorage.setItem(ACTIVE_USER_KEY, userId);
  else sessionStorage.removeItem(ACTIVE_USER_KEY);
}
export function getActiveUserId() { return sessionStorage.getItem(ACTIVE_USER_KEY); }
export function readUserProfile(userId: string) { return read(userKey(userId)); }
export function readActiveProfile() {
  const userId = getActiveUserId();
  return userId ? readUserProfile(userId) : null;
}
export function saveUserProfile(userId: string, profile: OnboardingProfile) { write(userKey(userId), profile); }
export function claimPendingProfile(userId: string) {
  const pending = readPendingProfile();
  if (pending) { saveUserProfile(userId, pending); clearPendingProfile(); }
  return pending ?? readUserProfile(userId);
}
