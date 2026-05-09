import { ActionId, WorkflowAction, WorkflowSourceType } from "./types";

// ============================================================
// Built-in workflow actions (transforms / nav / task)
// ============================================================
const BUILTIN_ACTIONS: Record<string, WorkflowAction> = {
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
  "image-hero": { id: "image-hero", label: "Hero Image", description: "Generate a cover image (50 words)", category: "amplify", isAI: true, isNav: false },
  "image-social-pack": { id: "image-social-pack", label: "Social Card Pack", description: "4 sized variants: IG, Story, Twitter, OG (200 words)", category: "amplify", isAI: true, isNav: false },
};

// Image action helpers
export const IMAGE_ACTION_IDS = new Set(["image-hero", "image-social-pack"]);
export function isImageAction(actionId: string): boolean {
  return IMAGE_ACTION_IDS.has(actionId);
}
export const IMAGE_ACTION_WORD_COST: Record<string, number> = {
  "image-hero": 50,
  "image-social-pack": 200,
};
export const SOCIAL_PACK_VARIANTS = [
  { key: "instagram", label: "Instagram (1:1)", template: "social-media" },
  { key: "story", label: "Story (9:16)", template: "social-media" },
  { key: "twitter", label: "Twitter (16:9)", template: "banner" },
  { key: "og", label: "OG Card (1200x630)", template: "banner" },
];

// ============================================================
// Template actions — every PeakDraft template is exposed as an
// AI workflow action so users can chain ANY generator.
// IDs use the `tpl-` prefix; the runner strips it to call
// `generate-content` with the matching template_type.
// ============================================================
export interface TemplateActionMeta {
  id: string;          // e.g. "tpl-blog"
  templateId: string;  // e.g. "blog" — sent as template_type
  label: string;
  description: string;
  category: WorkflowAction["category"];
}

export const TEMPLATE_ACTIONS: TemplateActionMeta[] = [
  { id: "tpl-blog",                    templateId: "blog",                    label: "Template: Blog Post",            description: "Generate a full blog post", category: "transform" },
  { id: "tpl-social",                  templateId: "social",                  label: "Template: Social Media",         description: "Generate engaging social posts", category: "transform" },
  { id: "tpl-email",                   templateId: "email",                   label: "Template: Email Writer",         description: "Craft a professional email", category: "transform" },
  { id: "tpl-ads",                     templateId: "ads",                     label: "Template: Ad Copy",              description: "High-converting advertisement copy", category: "transform" },
  { id: "tpl-humanize",                templateId: "humanize",                label: "Template: Humanize Text",        description: "Make AI text sound human", category: "transform" },
  { id: "tpl-cv",                      templateId: "cv",                      label: "Template: CV / Resume",          description: "Build an ATS-friendly CV", category: "transform" },
  { id: "tpl-product",                 templateId: "product",                 label: "Template: Product Description",  description: "Compelling product copy", category: "transform" },
  { id: "tpl-letter",                  templateId: "letter",                  label: "Template: Business Letter",      description: "Professional letter writer", category: "transform" },
  { id: "tpl-script",                  templateId: "script",                  label: "Template: Video Script",         description: "Scripts with timing cues", category: "transform" },
  { id: "tpl-hashtag",                 templateId: "hashtag",                 label: "Template: Hashtag Generator",    description: "Trending hashtag sets", category: "transform" },
  { id: "tpl-post-ideas",              templateId: "post-ideas",              label: "Template: Post Ideas",           description: "Creative content ideas", category: "transform" },
  { id: "tpl-chatgpt-prompt",          templateId: "chatgpt-prompt",          label: "Template: ChatGPT Prompt",       description: "Optimized AI prompts", category: "transform" },
  { id: "tpl-image-prompt",            templateId: "image-prompt",            label: "Template: Image Prompt",         description: "Detailed AI image prompts", category: "transform" },
  { id: "tpl-video-prompt",            templateId: "video-prompt",            label: "Template: Video Prompt",         description: "Production-ready video prompts", category: "transform" },
  { id: "tpl-proposal",                templateId: "proposal",                label: "Template: Proposal",             description: "Business / project proposals", category: "transform" },
  { id: "tpl-court-report",            templateId: "court-report",            label: "Template: Court Report",         description: "Formal legal documents", category: "transform" },
  { id: "tpl-ads-image-prompt",        templateId: "ads-image-prompt",        label: "Template: Ads Image Prompt",     description: "Prompts for ad imagery", category: "transform" },
  { id: "tpl-background-image-prompt", templateId: "background-image-prompt", label: "Template: Background Image",     description: "Prompts for backgrounds", category: "transform" },
  { id: "tpl-friendly-letter",         templateId: "friendly-letter",         label: "Template: Friendly Letter",      description: "Warm personal letters", category: "transform" },
  { id: "tpl-cover-letter",            templateId: "cover-letter",            label: "Template: Cover Letter",         description: "Job-winning cover letters", category: "transform" },
  { id: "tpl-press-release",           templateId: "press-release",           label: "Template: Press Release",        description: "Media-ready announcements", category: "transform" },
  { id: "tpl-business-plan",           templateId: "business-plan",           label: "Template: Business Plan",        description: "Investor-ready plans", category: "transform" },
  { id: "tpl-linkedin-post",           templateId: "linkedin-post",           label: "Template: LinkedIn Post",        description: "Engaging LinkedIn content", category: "transform" },
  { id: "tpl-newsletter",              templateId: "newsletter",              label: "Template: Newsletter",           description: "Subscriber newsletters", category: "transform" },
  { id: "tpl-product-review",          templateId: "product-review",          label: "Template: Product Review",       description: "Authentic review writing", category: "transform" },
  { id: "tpl-excel",                   templateId: "excel",                   label: "Template: Excel Generator",      description: "Spreadsheet plans & data", category: "transform" },
];

// Build the full action map (built-in + template actions)
const TEMPLATE_ACTION_ENTRIES: Record<string, WorkflowAction> = Object.fromEntries(
  TEMPLATE_ACTIONS.map((t) => [
    t.id,
    {
      id: t.id,
      label: t.label,
      description: t.description,
      category: t.category,
      isAI: true,
      isNav: false,
    } as WorkflowAction,
  ])
);

export const ALL_ACTIONS: Record<string, WorkflowAction> = {
  ...BUILTIN_ACTIONS,
  ...TEMPLATE_ACTION_ENTRIES,
};

// Helper: is this action backed by a PeakDraft template?
export function isTemplateAction(actionId: string): boolean {
  return actionId.startsWith("tpl-");
}

export function getTemplateIdFromAction(actionId: string): string | null {
  const meta = TEMPLATE_ACTIONS.find((t) => t.id === actionId);
  return meta?.templateId || null;
}

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

  // Template actions: pass the user's content as the topic/brief for that template's generator.
  if (typeof action === "string" && action.startsWith("tpl-")) {
    const meta = TEMPLATE_ACTIONS.find((t) => t.id === action);
    const label = meta?.label.replace(/^Template:\s*/, "") || "content";
    return `Use the following input as the topic/brief and produce a high-quality ${label}. Stay focused on this topic and follow best practices for the format.\n\nInput:\n${excerpt}`;
  }

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
