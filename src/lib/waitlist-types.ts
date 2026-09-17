export type WaitlistResult = {
  status: "idle" | "success" | "error";
  message: string;
};

export type WaitlistContact = {
  id: string;
  created: boolean;
};

export type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      action: string;
      "response-field-name": string;
    },
  ) => string;
  reset: (id: string) => void;
  remove: (id: string) => void;
};
