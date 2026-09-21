export type UpdatesSignupResult = {
  status: "idle" | "success" | "error";
  message: string;
};

export type UpdatesSignupPreviewState =
  | "idle"
  | "submitting"
  | "success"
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
