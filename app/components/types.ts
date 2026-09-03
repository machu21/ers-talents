export type Agent = {
  opportunityId: string;
  name: string;
  role: string;
  stage: string;
  loomUrl?: string;
};

export type ToastState = {
  type: "success" | "error";
  message: string;
} | null;
