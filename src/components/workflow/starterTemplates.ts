import { ActionId, WorkflowSourceType } from "./types";

export interface StarterTemplate {
  key: string; // stable identifier for de-dup
  name: string;
  description: string;
  source_types: WorkflowSourceType[];
  actions: ActionId[];
  use_brand_context: boolean;
}

export const STARTER_TEMPLATES: StarterTemplate[] = [
  {
    key: "starter-blog-launch-kit",
    name: "Blog Launch Kit",
    description:
      "Take any blog draft and prep it for publishing: outline check, SEO meta, hashtags, social teaser, and a quick image prompt.",
    source_types: ["blog", "general"],
    actions: ["improve", "seo", "hashtags", "repurpose", "image"],
    use_brand_context: true,
  },
  {
    key: "starter-product-drop-bundle",
    name: "Product Drop Bundle",
    description:
      "Turn a product description into a launch-ready bundle: punchy ad copy, social posts, hashtags, and an email announcement.",
    source_types: ["ad", "social", "email", "general"],
    actions: ["tone", "repurpose", "hashtags", "email"],
    use_brand_context: true,
  },
  {
    key: "starter-newsletter-repurpose",
    name: "Newsletter Repurpose",
    description:
      "Squeeze every drop out of a newsletter — summarize, repurpose into social, generate hashtags, and translate for global audiences.",
    source_types: ["email", "blog", "general"],
    actions: ["summarize", "repurpose", "hashtags", "translate"],
    use_brand_context: true,
  },
];
