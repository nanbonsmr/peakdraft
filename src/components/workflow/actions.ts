import { ActionId, WorkflowAction, WorkflowSourceType } from "./types";

export const ALL_ACTIONS: Record<ActionId, WorkflowAction> = {
  seo: { id: "seo", label: "SEO Metadata", description: "Meta title, description & keywords", category: "amplify", isAI: true, isNav: false },
  hashtags: { id: "hashtags", label: "Hashtags", description: "Platform-ready hashtag set", category: "amplify", isAI: true, isNav: false },
  image: { id: "image", label: "Generate Image", description: "Open AI image studio", category: "navigate", isAI: false, isNav: true },
  task: { id: "task", label: "Add to Tasks", description: "Track this as a task", category: "task", isAI: false, isNav: false },
  blog: { id: "blog", label: "Open in Editor", description: "Send to rich text editor", category: "navigate", isAI: false, isNav: true },
  social: { id: "social", label: "Adapt for Social", description: "Open social media generator", category: "navigate", isAI: false, isNav: true },
  email: { id: "email", label: "Turn into Email", description: "Open email generator", category: "navigate", isAI: false, isNav: true },
  chat: { id: "chat", label: "Discuss in Chat", description: "Continue in AI Chat", category: "navigate", isAI: false, isNav: true },
  translate: { id: "translate", label: "Translate", description: "Translate to another language", category: "transform", isAI: true, isNav: false },
  summarize: { id: "summarize", label: "Summarize", description: "Concise TL;DR + bullets", category: "transform", isAI: true, isNav: false },
  repurpose: { id: "repurpose", label: "Repurpose to 5 formats", description: "Tweet, LinkedIn, IG, email, headline", category: "transform", isAI: true, isNav: false },
  tone: { id: "tone", label: "Shift Tone", description: "Rewrite in a new voice", category: "transform", isAI: true, isNav: false },
  improve: { id: "improve", label: "Improve Writing", description: "Polish clarity & flow", category: "transform", isAI: true, isNav: false },
  outline: { id: "outline", label: "Generate Outline", description: "Structured outline of this content", category: "transform", isAI: true, isNav: false },
};

export function getRelevantActions(type: WorkflowSourceType): ActionId[] {
  switch (type) {
    case "blog":
      return ["seo", "hashtags", "summarize", "repurpose", "image", "social", "translate", "improve", "task", "chat"];
    case "email":
      return ["improve", "tone", "summarize", "translate", "social", "task", "chat"];
    case "social":
      return ["hashtags", "repurpose", "tone", "image", "blog", "translate", "task", "chat"];
    case "ad":
      return ["improve", "tone", "image", "hashtags", "repurpose", "task", "chat"];
    case "chat":
      return ["task", "blog", "summarize", "social", "email", "image", "outline"];
    case "task":
      return ["outline", "blog", "social", "email", "chat", "image"];
    default:
      return ["seo", "hashtags", "summarize", "improve", "image", "task", "blog", "social", "translate", "chat"];
  }
}

export function buildActionPrompt(action: ActionId, content: string, options: Record<string, string> = {}): string {
  const excerpt = content.slice(0, 2500);
  switch (action) {
    case "seo":
      return `Generate SEO metadata for the following content. Return:\n- Meta Title (under 60 chars)\n- Meta Description (under 160 chars)\n- 5-8 Keywords (comma separated)\nUse clear labels.\n\nContent:\n${excerpt}`;
    case "hashtags":
      return `Generate 15-20 relevant hashtags for the content below. Mix popular and niche. Return as a single line of space-separated hashtags.\n\nContent:\n${excerpt}`;
    case "translate":
      return `Translate the following content into ${options.language || "Spanish"}. Preserve formatting, tone, and structure. Return only the translation.\n\nContent:\n${excerpt}`;
    case "summarize":
      return `Summarize the following content. Return a 2-sentence TL;DR followed by 4-6 key bullet points.\n\nContent:\n${excerpt}`;
    case "repurpose":
      return `Repurpose the following content into 5 distinct formats. Use clear headings:\n1. Tweet (under 280 chars)\n2. LinkedIn post (3-5 short paragraphs, professional)\n3. Instagram caption (engaging, with emojis)\n4. Email subject + 2-sentence preview\n5. Punchy headline + subhead\n\nContent:\n${excerpt}`;
    case "tone":
      return `Rewrite the following content in a ${options.tone || "professional"} tone. Keep meaning and length similar. Return only the rewritten text.\n\nContent:\n${excerpt}`;
    case "improve":
      return `Improve the following content for clarity, flow, and impact. Fix grammar and tighten weak sentences. Preserve voice and meaning. Return only the improved text.\n\nContent:\n${excerpt}`;
    case "outline":
      return `Create a structured, hierarchical outline (H1/H2/H3 with bullets) based on the following content. Return only the outline.\n\nContent:\n${excerpt}`;
    default:
      return excerpt;
  }
}

export const TONE_OPTIONS = ["professional", "casual", "witty", "persuasive", "friendly", "authoritative", "empathetic"];
export const LANGUAGE_OPTIONS = [
  "Spanish", "French", "German", "Italian", "Portuguese", "Dutch", "Polish",
  "Japanese", "Korean", "Chinese", "Arabic", "Hindi", "Turkish", "Russian", "English",
];
