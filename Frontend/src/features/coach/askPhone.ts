// Lets any page ask the AI Phone (AIPhone.tsx) a question: the phone opens and sends it.
// Used by "Ask the coach" on the Portfolio page.
export const ASK_EVENT = "aiphone:ask";

export function askPhone(question: string) {
  window.dispatchEvent(new CustomEvent<string>(ASK_EVENT, { detail: question }));
}
