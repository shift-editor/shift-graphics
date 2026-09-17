"use server";

import * as waitlist from "@/lib/waitlist";
import type { WaitlistResult } from "@/lib/waitlist-types";

export async function submitWaitlist(
  _previous: WaitlistResult,
  formData: FormData,
): Promise<WaitlistResult> {
  return waitlist.submitWaitlist(formData);
}

export async function unsubscribeContact(
  _previous: WaitlistResult,
  formData: FormData,
): Promise<WaitlistResult> {
  return waitlist.unsubscribeContact(formData);
}
