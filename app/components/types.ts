export type Agent = {
  opportunityId: string;
  contactId?: string;
  name: string;
  role: string;
  stage: string;
  loomUrl?: string;
  thumbnailUrl?: string;
  hrInfo?: string;
  clientRate?: string;
};

export type ToastState = {
  type: "success" | "error";
  message: string;
} | null;
