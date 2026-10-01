"use server";

import * as updates from "@/lib/updates";
import type { UpdatesSignupResult } from "@/lib/updates-types";

export async function subscribeToUpdates(
  _previous: UpdatesSignupResult,
  formData: FormData,
): Promise<UpdatesSignupResult> {
  return updates.subscribeToUpdates(formData);
}
