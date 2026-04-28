export type WorkflowSourceType = "blog" | "email" | "social" | "ad" | "chat" | "general" | "task";

export type WorkflowContext = {
  content: string;
  title?: string;
  type: WorkflowSourceType;
  keywords?: string[];
};

// Built-in workflow actions. Template actions (one per template, e.g. "tpl-blog")
// are added dynamically in actions.ts and use string ids prefixed with `tpl-`.
export type ActionId =
  | "seo"
  | "hashtags"
  | "image"
  | "task"
  | "blog"
  | "social"
  | "email"
  | "chat"
  | "translate"
  | "summarize"
  | "repurpose"
  | "tone"
  | "improve"
  | "outline"
  | (string & {}); // allow dynamic template-action ids while keeping autocomplete

export interface WorkflowAction {
  id: ActionId;
  label: string;
  description: string;
  category: "amplify" | "transform" | "navigate" | "task";
  isAI: boolean; // runs an AI prompt inline
  isNav: boolean; // navigates away
}

export interface SmartSuggestion {
  action: ActionId;
  reason: string;
  priority: "high" | "medium" | "low";
}

export interface ChainStep {
  id: string;
  action: ActionId;
  status: "pending" | "running" | "done" | "failed";
  result?: string;
  error?: string;
}

export interface ActionResult {
  action: ActionId;
  result: string;
  ranAt: string;
}
