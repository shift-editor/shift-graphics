export type UpdatesSignupResult = {
  status: "idle" | "success" | "error";
  message: string;
  /** Set when the error is about what was typed rather than the signup failing. */
  field?: "email";
};

export type UpdatesSignupPreviewState =
  | "idle"
  | "submitting"
  | "success"
  | "invalid"
  | "error";

export type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      appearance: "interaction-only";
      "response-field-name": string;
    },
  ) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
