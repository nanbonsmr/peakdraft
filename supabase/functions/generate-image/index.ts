import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, template_type, style_preset, mode, source_image_url, edit_instruction } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // === EDIT MODE ===
    if (mode === 'edit') {
      if (!source_image_url || !edit_instruction) {
        throw new Error("source_image_url and edit_instruction are required for edit mode");
      }

      console.log('Edit mode: Editing image with instruction:', edit_instruction.substring(0, 200));

      const editResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image",
          messages: [{
            role: "user",
            content: [
              { type: "text", text: `You are an expert image editor. Apply the following edit precisely and professionally: ${edit_instruction}. Maintain the overall quality, style, and composition of the original image while making the requested changes.` },
              { type: "image_url", image_url: { url: source_image_url } }
            ]
          }],
          modalities: ["image", "text"],
        }),
      });

      if (!editResponse.ok) {
        if (editResponse.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (editResponse.status === 402) {
          return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const errText = await editResponse.text();
        console.error("Image edit error:", editResponse.status, errText);
        throw new Error(`Image editing failed: ${editResponse.status}`);
      }

      const editData = await editResponse.json();
      const editMessage = editData.choices?.[0]?.message;
      const editedImageUrl = editMessage?.images?.[0]?.image_url?.url;
      const editDescription = editMessage?.content || '';

      if (!editedImageUrl) {
        throw new Error("Image editing failed. Please try a different instruction.");
      }

      console.log('Image edited successfully');
      return new Response(JSON.stringify({ image_url: editedImageUrl, description: editDescription }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // === GENERATE MODE ===
    // Step 1: Use a text model to craft an expert-level image prompt
    const metaPrompt = buildMetaPrompt(prompt, template_type, style_preset);
    
    console.log('Step 1: Generating expert prompt via text model...');
    
    const textResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: getSystemPrompt() },
          { role: "user", content: metaPrompt }
        ],
      }),
    });

    if (!textResponse.ok) {
      const errText = await textResponse.text();
      console.error("Text model error:", textResponse.status, errText);
      throw new Error(`Prompt refinement failed: ${textResponse.status}`);
    }

    const textData = await textResponse.json();
    const refinedPrompt = textData.choices?.[0]?.message?.content?.trim();
    
    if (!refinedPrompt) {
      throw new Error("Failed to generate refined prompt");
    }

    console.log('Refined prompt (first 300 chars):', refinedPrompt.substring(0, 300));

    // Step 2: Generate the image with the refined prompt
    console.log('Step 2: Generating image with refined prompt...');
    
    const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: refinedPrompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!imageResponse.ok) {
      if (imageResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (imageResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await imageResponse.text();
      console.error("Image generation error:", imageResponse.status, errorText);
      throw new Error(`Image generation failed: ${imageResponse.status}`);
    }

    const imageData = await imageResponse.json();
    const message = imageData.choices?.[0]?.message;
    const imageUrl = message?.images?.[0]?.image_url?.url;
    const textContent = message?.content || '';

    if (!imageUrl) {
      throw new Error("No image was generated. Please try a different prompt.");
    }

    console.log('Image generated successfully');

    return new Response(JSON.stringify({ image_url: imageUrl, description: textContent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getSystemPrompt(): string {
  return `You are an elite visual design director and AI image prompt engineer with 20 years of experience in graphic design, photography, and digital art. Your specialty is writing incredibly detailed, production-quality prompts that produce stunning images from AI generators.

Your prompts must include ALL of these elements when relevant:
1. **Subject & Composition** — What is the focal point? Rule of thirds? Leading lines? Symmetry? Negative space?
2. **Lighting** — Golden hour, studio lighting, rim light, dramatic chiaroscuro, soft diffused, neon glow, backlit, volumetric rays
3. **Color Palette** — Specific colors, complementary schemes, warm/cool tones, gradients, monochromatic with accent
4. **Mood & Atmosphere** — Emotional tone, energy level, sophistication, warmth, drama
5. **Technical Quality** — Resolution feel (8K, ultra-detailed), depth of field, bokeh, sharpness, texture detail
6. **Style Reference** — Photorealistic, editorial photography, 3D render, flat design, watercolor, cinematic, etc.
7. **Typography Guidance** — If text/layout space is needed, describe placement, hierarchy, and style
8. **Background & Environment** — Detailed setting, textures, gradients, patterns, environmental storytelling

RULES:
- Output ONLY the image generation prompt. No explanations, no markdown, no labels.
- Be extremely specific with visual details — vague prompts create vague images.
- Use professional photography and design terminology.
- Every prompt should feel like a creative brief from a top-tier design agency.
- Aim for images that look like they were made by a professional designer, not AI.`;
}

function buildMetaPrompt(userPrompt: string, templateType: string, stylePreset: string): string {
  const templateContext: Record<string, string> = {
    'social-media': `TEMPLATE: Social Media Post
FORMAT: Square (1:1) optimized for Instagram/Facebook/LinkedIn
REQUIREMENTS:
- Eye-catching hero visual that stops the scroll
- Clean composition with clear visual hierarchy
- Space for text overlay (headline area at top or center)
- Vibrant, high-contrast design that pops on mobile feeds
- Professional but engaging — not stock-photo-looking
- Consider how it looks as a small thumbnail in a feed
- Brand-quality feel with intentional color usage`,

    'poster': `TEMPLATE: Professional Poster
FORMAT: Portrait orientation (2:3 or similar)
REQUIREMENTS:
- Dramatic, cinematic composition with strong visual impact
- Clear visual hierarchy: primary focal point, secondary elements, background
- Designated areas for headline text (top or center) and supporting info (bottom)
- Print-quality detail level with rich textures and depth
- Professional typographic layout considerations
- Bold color choices that command attention from a distance
- Gallery-worthy artistic quality`,

    'advertisement': `TEMPLATE: Digital Advertisement
FORMAT: Flexible (works for banners, squares, stories)
REQUIREMENTS:
- Immediate visual hook — grabs attention in under 1 second
- Clean, uncluttered layout with strong focal point
- Clear space for call-to-action button placement
- Professional product/service representation
- Emotional connection through visual storytelling
- Brand-consistent color palette
- High conversion design principles: contrast, direction, urgency
- Should look like it's from a Fortune 500 ad campaign`,

    'youtube-thumbnail': `TEMPLATE: YouTube Thumbnail
FORMAT: Wide (16:9) landscape
REQUIREMENTS:
- Maximum click-through-rate optimization
- Bold, high-contrast colors that pop against YouTube's white/dark UI
- Dramatic composition — action, emotion, or intrigue
- Large open space for bold text overlay (usually right side or center)
- Expressive visual storytelling in a single frame
- Should be readable and compelling at 120x68px (tiny thumbnail size)
- Avoid clutter — 2-3 visual elements maximum
- Creates curiosity gap that makes viewers want to click`,

    'logo': `TEMPLATE: Logo / Brand Mark Design
FORMAT: Square, scalable, works on any background
REQUIREMENTS:
- Clean, memorable, and instantly recognizable
- Works at all sizes from favicon (16px) to billboard
- Professional negative space usage
- Thoughtful typography integration (if wordmark)
- Versatile — works on light backgrounds, dark backgrounds, and colored surfaces
- Timeless design that won't look dated in 5 years
- Conveys brand personality through shape, color, and form
- Simple enough to be recognizable in one glance`,

    'banner': `TEMPLATE: Web Banner / Cover Image
FORMAT: Ultra-wide landscape (3:1 or 4:1)
REQUIREMENTS:
- Professional hero section quality
- Smooth gradients, modern glass effects, or subtle textures
- Clear left-to-right visual flow
- Space for headline text (usually left-aligned or centered)
- Works as LinkedIn cover, Twitter header, website hero, or email banner
- Sophisticated color transitions
- Layered depth with foreground/background separation
- Corporate-grade polish and refinement`,

    'product-mockup': `TEMPLATE: Product Mockup / Lifestyle Shot
FORMAT: Square or landscape
REQUIREMENTS:
- Photorealistic product presentation
- Professional studio lighting OR lifestyle context
- Beautiful environment that tells a story about the product
- Shallow depth of field with creamy bokeh on background
- Attention to material textures, reflections, and shadows
- Magazine-quality product photography feel
- Natural color grading — not over-processed
- Makes the product look premium and desirable`,

    'infographic': `TEMPLATE: Infographic / Data Visualization
FORMAT: Portrait or square
REQUIREMENTS:
- Clean, structured layout with clear visual sections
- Modern icon design and data visualization elements
- Consistent color coding for categories or data points
- Professional typography hierarchy (title, sections, data labels)
- Visual flow that guides the eye from top to bottom
- Balanced use of charts, icons, and whitespace
- Corporate presentation quality
- Makes complex information look beautiful and accessible`,
  };

  const styleContext: Record<string, string> = {
    'minimal': `STYLE DIRECTION: Minimalist
- Abundant whitespace and breathing room
- Maximum 2-3 colors, preferring neutrals with one accent
- Clean geometric shapes, thin lines
- Swiss/Scandinavian design influence
- "Less is more" — every element earns its place
- Elegant simplicity that feels expensive`,

    'vibrant': `STYLE DIRECTION: Vibrant & Bold
- Saturated, electric colors — think gradient meshes and vivid neons
- High energy, dynamic compositions with movement
- Bold geometric shapes, overlapping elements
- Pop art influence meets modern design
- Maximum visual impact and excitement
- Festival/celebration energy`,

    'professional': `STYLE DIRECTION: Corporate Professional
- Refined, sophisticated color palette (navy, charcoal, gold, white)
- Clean structure and precise alignment
- Premium material feel — glass, metal, polished surfaces
- Conservative but elegant typography
- Trust-building visual language
- Fortune 500 / McKinsey presentation quality`,

    'artistic': `STYLE DIRECTION: Artistic & Creative
- Painterly textures, brush strokes, or mixed media feel
- Unexpected color combinations that create visual poetry
- Abstract elements blended with representational imagery
- Gallery-worthy artistic composition
- Emotional depth and visual storytelling
- Fine art meets commercial design`,

    'dark': `STYLE DIRECTION: Dark & Moody
- Deep blacks, rich shadows, and selective lighting
- Neon accents or metallic highlights against darkness
- Cinematic atmosphere with dramatic contrast
- Mysterious, premium, luxury feel
- Volumetric light rays, lens flares, or subtle glow effects
- High-end gaming or luxury brand aesthetic`,

    'retro': `STYLE DIRECTION: Retro / Vintage
- Warm, nostalgic color grading (amber, burnt orange, dusty rose)
- Film grain, light leaks, or analog photography effects
- 70s/80s typography and layout references
- Textured paper or worn material backgrounds
- Halftone dots or screen print effects where appropriate
- Authentically vintage, not just a filter overlay`,
  };

  const template = templateContext[templateType] || templateContext['social-media'];
  const style = styleContext[stylePreset] || styleContext['professional'];

  return `Create an expert-level, production-quality image generation prompt based on the following brief:

${template}

${style}

USER'S CREATIVE BRIEF: "${userPrompt}"

Transform this brief into a single, comprehensive image generation prompt that a professional designer would create. Include specific details about composition, lighting, colors, textures, mood, and technical quality. The output should be ONLY the prompt text — no labels, no explanations, no formatting.`;
}
