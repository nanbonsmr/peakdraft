import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt, template_type, style_preset } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build an enhanced prompt based on template type
    const templatePrompts: Record<string, string> = {
      'social-media': `Create a professional, eye-catching social media post image. The design should be modern, vibrant, and optimized for engagement. Include bold typography placement areas and a clean composition. Aspect ratio suitable for Instagram/Facebook posts (1:1 square). `,
      'poster': `Create a stunning, high-quality poster design. The composition should be dramatic with clear visual hierarchy, bold colors, and professional layout. Include space for headline text and supporting information. Print-quality resolution feel. `,
      'advertisement': `Create a compelling advertisement image that drives action. The design should be clean, professional, and attention-grabbing with clear focal point. Include visual space for a call-to-action button and brand messaging. `,
      'youtube-thumbnail': `Create an engaging YouTube thumbnail that maximizes click-through rate. Use bold, contrasting colors, dramatic composition, and clear visual storytelling. Leave space for large text overlay. Aspect ratio 16:9. `,
      'logo': `Create a professional, memorable logo design. The design should be clean, scalable, and work on both light and dark backgrounds. Modern aesthetic with thoughtful use of negative space and typography. `,
      'banner': `Create a professional web banner image. Wide aspect ratio (3:1), clean composition with gradient backgrounds, modern typography areas, and professional visual elements suitable for website headers or social media covers. `,
      'product-mockup': `Create a realistic product mockup in a lifestyle setting. Professional lighting, clean background, and appealing composition that showcases the product beautifully. Studio-quality photography feel. `,
      'infographic': `Create a visually appealing infographic-style image with modern design elements, icons, charts, and clean data visualization sections. Use a structured layout with clear visual hierarchy and professional color palette. `,
    };

    const styleInstructions: Record<string, string> = {
      'minimal': 'Style: Clean, minimalist design with lots of white space, simple color palette, and elegant typography.',
      'vibrant': 'Style: Bold, vibrant colors with high contrast, dynamic compositions, and energetic visual elements.',
      'professional': 'Style: Corporate and professional aesthetic with muted tones, structured layout, and refined typography.',
      'artistic': 'Style: Artistic and creative with unique textures, painterly effects, and expressive color combinations.',
      'dark': 'Style: Dark theme with moody lighting, deep shadows, neon accents, and dramatic atmosphere.',
      'retro': 'Style: Retro/vintage aesthetic with warm tones, grain textures, and nostalgic design elements.',
    };

    const basePrompt = templatePrompts[template_type] || 'Create a professional, high-quality image. ';
    const styleText = styleInstructions[style_preset] || styleInstructions['professional'];
    const fullPrompt = `${basePrompt}${styleText} User request: ${prompt}. Make it photorealistic and high quality unless abstract/illustration is specifically requested.`;

    console.log('Generating image with prompt:', fullPrompt.substring(0, 200));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages: [{ role: "user", content: fullPrompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message;
    const imageUrl = message?.images?.[0]?.image_url?.url;
    const textContent = message?.content || '';

    if (!imageUrl) {
      throw new Error("No image was generated. Please try a different prompt.");
    }

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
