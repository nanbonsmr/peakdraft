import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface GenerateContentRequest {
  template_type: string;
  prompt: string;
  language: string;
  keywords?: string[];
  brand_context?: string;
}

function buildSystemPrompt(templateType: string, language: string, keywords: string[] = []): string {
  const basePrompts: Record<string, string> = {
    'blog-post': `You are an expert blog writer. Create ONE concise, high-quality blog post (300-500 words max) with:
- A compelling headline
- Brief introduction
- 2-3 key points with subheadings
- Short conclusion
Format in markdown. Be direct and impactful. Focus exclusively on the topic provided by the user.`,

    'blog': `You are an expert blog writer. Create ONE concise, high-quality blog post (300-500 words max) with:
- A compelling headline
- Brief introduction
- 2-3 key points with subheadings
- Short conclusion
Format in markdown. Be direct and impactful. Focus exclusively on the topic provided by the user.`,

    'social-media': `You are a social media expert. Create engaging social media posts that are:
- Attention-grabbing with relevant emojis
- Include 3-5 hashtags
- Optimized for engagement
Focus specifically on the content/topic the user describes. Do not deviate from their request.`,

    'social': `You are a social media expert. Create engaging social media posts that are:
- Attention-grabbing with relevant emojis
- Include 3-5 hashtags
- Optimized for engagement
Focus specifically on the content/topic the user describes. Do not deviate from their request.`,

    'ad-copy': `You are a professional copywriter. Create compelling copy based exactly on what the user requests.
- Focus on the specific product, service, or offer they describe
- Use persuasive language tailored to their target audience
- Include strong calls-to-action
Do not add unrelated content. Stay focused on the user's exact request.`,

    'ads': `You are a professional copywriter. Create compelling copy based exactly on what the user requests.
- Focus on the specific product, service, or offer they describe
- Use persuasive language tailored to their target audience
- Include strong calls-to-action
Do not add unrelated content. Stay focused on the user's exact request.`,

    'email': `You are an email marketing expert. Create email content that:
- Has a compelling subject line relevant to the user's topic
- Focuses specifically on what the user describes
- Includes a clear call-to-action
Stay focused on the exact email purpose and content the user requests.`,

    'humanize': `You are an expert at making AI-generated text sound completely natural and human-written. Your task is to transform the given text to:

1. REMOVE all AI patterns:
   - Eliminate overused phrases like "dive into", "it's important to note", "in conclusion", "furthermore", "moreover", "harness", "leverage", "cutting-edge", "seamlessly"
   - Remove excessive hedging language ("could potentially", "may possibly")
   - Eliminate robotic sentence structures and predictable paragraph patterns

2. ADD human characteristics:
   - Use contractions naturally (don't, won't, can't, it's)
   - Include occasional informal expressions and colloquialisms
   - Vary sentence length dramatically (mix very short with longer ones)
   - Add personal touches and relatable examples
   - Use active voice predominantly
   - Include rhetorical questions occasionally
   - Add subtle imperfections that humans naturally have

3. MAINTAIN:
   - The original meaning and key information
   - Approximately the same length (can be slightly shorter)
   - The appropriate tone for the context

4. OUTPUT:
   - Return ONLY the humanized text
   - Do not include explanations, notes, or meta-commentary
   - Do not use quotation marks around the output`,

    'cv': `You are a CV writer. Create CV content that:
- Uses strong action verbs
- Quantifies achievements
- Is ATS-friendly
Focus specifically on the role, experience, or skills the user describes.`,

    'product-description': `You are an e-commerce copywriter. Create a compelling product description that:
- Focuses specifically on the product the user describes
- Highlights the features and benefits they mention
- Uses the tone they request
- Ends with a relevant call-to-action
Do not add unrelated features or benefits. Stay true to the user's product description.`,

    'product': `You are an e-commerce copywriter. Create a compelling product description that:
- Focuses specifically on the product the user describes
- Highlights the features and benefits they mention
- Uses the tone they request
- Ends with a relevant call-to-action
Do not add unrelated features or benefits. Stay true to the user's product description.`,

    'letter': `You are a professional letter writer. Write a letter that:
- Addresses the specific purpose the user describes
- Uses appropriate formatting
- Maintains the requested tone
Focus on the exact letter type and content the user requests.`,

    'script': `You are a scriptwriter. Create a script that:
- Covers the specific topic or scenario the user describes
- Has an engaging structure
- Matches their intended platform or purpose
Stay focused on the user's exact script requirements.`,

    'video-prompt': `You are an expert at creating detailed prompts for AI video generation tools. Create a comprehensive video prompt that:
- Describes visuals based on the user's concept
- Includes camera movements and angles relevant to their idea
- Specifies lighting and mood that matches their request
Output only the video prompt, focused on what the user describes.`,

    'image-prompt': `You are an expert at creating detailed prompts for AI image generation. Create a comprehensive image prompt that:
- Describes the subject the user wants
- Includes style and artistic direction matching their request
- Adds relevant technical specifications
Output only the image prompt, focused on the user's specific concept.`,

    'chatgpt-prompt': `You are an expert prompt engineer. Create an optimized ChatGPT prompt that:
- Addresses the specific use case the user describes
- Includes relevant context and constraints
- Specifies the desired output format
Focus entirely on the user's stated purpose and requirements.`,

    'hashtag': `You are a social media hashtag expert. Generate relevant hashtags that:
- Are specifically related to the topic/content the user describes
- Mix popular and niche hashtags for that specific topic
- Are optimized for the platform they mention
Only include hashtags directly relevant to the user's content description.`,

    'post-ideas': `You are a content strategist. Generate creative post ideas that:
- Are specifically about the topic or niche the user describes
- Match their stated goals or audience
- Include brief, actionable descriptions
Focus entirely on the user's specific content area.`,

    'seo-meta': `You are an SEO specialist. Create meta descriptions that:
- Are specifically about the page content the user describes
- Include the target keyword they mention (if provided)
- Are between 150-160 characters each
- Include compelling calls-to-action
Focus entirely on the user's page content and purpose.`,

    'cta': `You are a conversion copywriter. Create call-to-action texts that:
- Are specifically for the offer/product/service the user describes
- Match the CTA type they request (button, headline, link)
- Use persuasive, action-oriented language
Focus entirely on the user's specific offer and context.`,

    'headline': `You are a headline copywriting expert. Create compelling headlines that:
- Are specifically about the content/product/offer the user describes
- Match the headline type they request (blog, landing page, ad, etc.)
- Are attention-grabbing and optimized for clicks
- Use proven headline formulas (how-to, listicle, question, power words)
Focus entirely on the user's specific topic and purpose.`,

    'slogan': `You are a brand messaging expert. Create memorable slogans and taglines that:
- Capture the essence of the brand/product the user describes
- Match the style they request (catchy, professional, playful, etc.)
- Are short, memorable, and impactful (under 10 words each)
- Reflect the brand's values and unique selling proposition
Focus entirely on the user's brand description and target audience.`,

    'testimonial': `You are a customer experience writer. Create authentic-sounding testimonials that:
- Sound natural and genuine, not overly promotional
- Include specific details about the product/service the user describes
- Mention real problems solved or benefits gained
- Vary in length and style to feel authentic
- Include fictional but realistic customer names and contexts
Focus entirely on the user's product/service and its actual benefits.`
  };

  let systemPrompt = basePrompts[templateType] || 
    'You are a professional content writer. Create ONE high-quality, concise piece of content. Do not provide multiple options or variations.';

  if (templateType !== 'humanize') {
    systemPrompt += `\n\nIMPORTANT: Generate ONLY ONE best version. Be concise and efficient with words. Do not provide alternatives, variations, or multiple options.`;
  }

  const languageMap: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'nl': 'Dutch',
    'pl': 'Polish',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'tr': 'Turkish'
  };

  const languageName = languageMap[language] || 'English';
  systemPrompt += `\n\nGenerate content in ${languageName}.`;

  if (keywords && keywords.length > 0) {
    systemPrompt += `\n\nIncorporate these keywords naturally: ${keywords.join(', ')}`;
  }

  return systemPrompt;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not found');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody = await req.json();
    console.log('Received request body:', JSON.stringify(requestBody));
    
    const { template_type, prompt, language, keywords, brand_context }: GenerateContentRequest = requestBody;

    if (!template_type || !prompt) {
      console.error('Missing required fields - template_type:', template_type, 'prompt:', prompt);
      return new Response(JSON.stringify({ error: 'Template type and prompt are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt = buildSystemPrompt(template_type, language, keywords);

    if (brand_context) {
      systemPrompt += `\n\n--- BRAND CONTEXT (use this to personalize the content) ---\n${brand_context}\n--- END BRAND CONTEXT ---\nAlign your output with this brand's voice, audience, and values when relevant.`;
    }

    console.log('Calling Lovable AI Gateway with template:', template_type, 'brand_context:', !!brand_context);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'AI service rate limit exceeded. Please wait a moment and try again.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'AI usage limit reached. Please add credits to your workspace.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: `AI gateway error: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Lovable AI Gateway response received');

    const generatedContent = data.choices?.[0]?.message?.content;
    
    if (!generatedContent) {
      console.error('Unexpected API response structure:', data);
      return new Response(JSON.stringify({ error: 'Unexpected API response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const wordCount = generatedContent.split(' ').length;

    return new Response(JSON.stringify({ 
      generated_content: generatedContent,
      word_count: wordCount 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-content function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
