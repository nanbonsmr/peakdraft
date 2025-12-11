import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const geminiApiKey = Deno.env.get('GOOGLE_GEMINI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateContentRequest {
  template_type: string;
  prompt: string;
  language: string;
  keywords?: string[];
}

function buildSystemPrompt(templateType: string, language: string, keywords: string[] = []): string {
  const basePrompts = {
    'blog-post': `You are an expert blog writer. Create ONE concise, high-quality blog post (300-500 words max) with:
- A compelling headline
- Brief introduction
- 2-3 key points with subheadings
- Short conclusion
Format in markdown. Be direct and impactful.`,

    'blog': `You are an expert blog writer. Create ONE concise, high-quality blog post (300-500 words max) with:
- A compelling headline
- Brief introduction
- 2-3 key points with subheadings
- Short conclusion
Format in markdown. Be direct and impactful.`,

    'social-media': `You are a social media expert. Create ONE best social media post (under 100 words) that is:
- Attention-grabbing with relevant emojis
- Includes 3-5 hashtags
- Optimized for engagement
Do not provide multiple options.`,

    'social': `You are a social media expert. Create ONE best social media post (under 100 words) that is:
- Attention-grabbing with relevant emojis
- Includes 3-5 hashtags
- Optimized for engagement
Do not provide multiple options.`,

    'ad-copy': `You are a professional copywriter. Create ONE compelling ad copy (under 150 words) with:
- A powerful headline
- Brief value proposition
- Strong call-to-action
Do not provide variations or multiple options.`,

    'ads': `You are a professional copywriter. Create ONE compelling ad copy (under 150 words) with:
- A powerful headline
- Brief value proposition
- Strong call-to-action
Do not provide variations or multiple options.`,

    'email': `You are an email marketing expert. Write ONE professional email (200-300 words max) with:
- Compelling subject line
- Brief, clear body
- Strong call-to-action
Do not provide multiple versions.`,

    'humanize': `You are an expert at making text sound natural and human. Transform the given text to:
- Sound conversational and authentic
- Remove robotic patterns
- Keep the same length or shorter
Preserve the core message. Output only the improved text.`,

    'cv': `You are a CV writer. Create ONE concise CV section (150-250 words) that:
- Uses strong action verbs
- Quantifies achievements
- Is ATS-friendly
Output only the requested content, no variations.`,

    'product-description': `You are an e-commerce copywriter. Create ONE compelling product description (100-200 words) that:
- Leads with key benefits
- Uses engaging language
- Ends with call-to-action
Do not provide multiple options.`,

    'product': `You are an e-commerce copywriter. Create ONE compelling product description (100-200 words) that:
- Leads with key benefits
- Uses engaging language
- Ends with call-to-action
Do not provide multiple options.`,

    'letter': `You are a professional letter writer. Write ONE concise letter (200-350 words) with:
- Proper formatting
- Clear purpose
- Professional tone
Do not provide alternatives.`,

    'script': `You are a scriptwriter. Create ONE concise script (200-400 words) with:
- Engaging hook
- Clear structure
- Strong conclusion
Do not provide multiple versions.`
  };

  let systemPrompt = basePrompts[templateType as keyof typeof basePrompts] || 
    'You are a professional content writer. Create ONE high-quality, concise piece of content. Do not provide multiple options or variations.';

  systemPrompt += `\n\nIMPORTANT: Generate ONLY ONE best version. Be concise and efficient with words. Do not provide alternatives, variations, or multiple options.`;

  systemPrompt += `\n\nGenerate content in ${language === 'en' ? 'English' : 
    language === 'es' ? 'Spanish' : 
    language === 'fr' ? 'French' : 
    language === 'de' ? 'German' : 'English'}.`;

  if (keywords && keywords.length > 0) {
    systemPrompt += `\n\nIncorporate these keywords naturally: ${keywords.join(', ')}`;
  }

  return systemPrompt;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!geminiApiKey) {
      console.error('Google Gemini API key not found');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestBody = await req.json();
    console.log('Received request body:', JSON.stringify(requestBody));
    
    const { template_type, prompt, language, keywords }: GenerateContentRequest = requestBody;

    if (!template_type || !prompt) {
      console.error('Missing required fields - template_type:', template_type, 'prompt:', prompt);
      return new Response(JSON.stringify({ error: 'Template type and prompt are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = buildSystemPrompt(template_type, language, keywords);
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    console.log('Calling Gemini API with template:', template_type);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'AI service is temporarily busy. Please wait a moment and try again.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify({ error: `API error: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('Gemini API response received');

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      console.error('Unexpected API response structure:', data);
      return new Response(JSON.stringify({ error: 'Unexpected API response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const generatedContent = data.candidates[0].content.parts[0].text;
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
