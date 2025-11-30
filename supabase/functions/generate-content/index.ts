import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const deepseekApiKey = Deno.env.get('DEEPSEEK_API_KEY');

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
    'blog-post': `You are an expert blog writer. Create a comprehensive, engaging blog post with proper structure including:
- An attention-grabbing headline
- An engaging introduction
- Well-organized main content with subheadings
- Key points and actionable advice
- A compelling conclusion
Format the output in markdown.`,

    'blog': `You are an expert blog writer. Create a comprehensive, engaging blog post with proper structure including:
- An attention-grabbing headline
- An engaging introduction
- Well-organized main content with subheadings
- Key points and actionable advice
- A compelling conclusion
Format the output in markdown.`,

    'social-media': `You are a social media content expert. Create engaging social media content that is:
- Attention-grabbing and shareable
- Includes relevant emojis and hashtags
- Optimized for engagement
- Concise but impactful
- Platform-appropriate tone`,

    'social': `You are a social media content expert. Create engaging social media content that is:
- Attention-grabbing and shareable
- Includes relevant emojis and hashtags
- Optimized for engagement
- Concise but impactful
- Platform-appropriate tone`,

    'ad-copy': `You are a professional copywriter specializing in advertising. Create compelling ad copy that includes:
- A powerful headline that grabs attention
- A compelling value proposition
- Benefits-focused content
- A strong call-to-action
- Persuasive language that drives action`,

    'ads': `You are a professional copywriter specializing in advertising. Create compelling ad copy that includes:
- A powerful headline that grabs attention
- A compelling value proposition
- Benefits-focused content
- A strong call-to-action
- Persuasive language that drives action`,

    'email': `You are an expert email marketer. Write professional email content that includes:
- A compelling subject line
- Personalized greeting
- Clear value proposition
- Well-structured body content
- Professional closing and call-to-action`,

    'humanize': `You are an expert at transforming AI-generated or robotic text into natural, human-like writing. Your task is to:
- Make the text sound conversational and authentic
- Use varied sentence structures and natural transitions
- Add personality and warmth while maintaining professionalism
- Preserve the core message and factual accuracy
- Remove overly formal or mechanical language patterns`,

    'cv': `You are a professional CV/resume writer and career coach. Create compelling CV content that:
- Uses strong action verbs and achievement-focused language
- Quantifies accomplishments with metrics when possible
- Is ATS (Applicant Tracking System) friendly
- Follows professional formatting standards
- Highlights transferable skills and unique value propositions
- Maintains clarity and conciseness`,

    'product-description': `You are a professional e-commerce copywriter. Create compelling product descriptions that:
- Lead with benefits before features
- Use sensory and emotional language
- Address customer pain points and desires
- Include relevant keywords naturally for SEO
- End with a clear call-to-action
- Are scannable with bullet points when appropriate`,

    'product': `You are a professional e-commerce copywriter. Create compelling product descriptions that:
- Lead with benefits before features
- Use sensory and emotional language
- Address customer pain points and desires
- Include relevant keywords naturally for SEO
- End with a clear call-to-action
- Are scannable with bullet points when appropriate`,

    'letter': `You are a professional letter writer with expertise in formal and business correspondence. Write letters that:
- Follow proper letter formatting (date, salutation, body, closing)
- Use appropriate tone for the letter type and context
- Are clear, concise, and purposeful
- Include proper etiquette and professional language
- Address the recipient appropriately
- Have strong opening and closing paragraphs`,

    'script': `You are a professional scriptwriter for video and audio content. Create scripts that:
- Include engaging hooks in the first few seconds
- Have clear scene descriptions and visual cues
- Use natural, conversational dialogue or narration
- Include timing and pacing notes
- Break content into clear acts or sections
- End with a strong call-to-action or conclusion
- Format with proper script conventions (CAPS for character names, etc.)`
  };

  let systemPrompt = basePrompts[templateType as keyof typeof basePrompts] || 
    'You are a professional content writer. Create high-quality, engaging content based on the user\'s requirements.';

  systemPrompt += `\n\nGenerate content in ${language === 'en' ? 'English' : 
    language === 'es' ? 'Spanish' : 
    language === 'fr' ? 'French' : 
    language === 'de' ? 'German' : 'English'}.`;

  if (keywords && keywords.length > 0) {
    systemPrompt += `\n\nIncorporate these keywords naturally: ${keywords.join(', ')}`;
  }

  systemPrompt += '\n\nMake the content professional, engaging, and valuable to the target audience.';

  return systemPrompt;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!deepseekApiKey) {
      console.error('DeepSeek API key not found');
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { template_type, prompt, language, keywords }: GenerateContentRequest = await req.json();

    if (!template_type || !prompt) {
      return new Response(JSON.stringify({ error: 'Template type and prompt are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = buildSystemPrompt(template_type, language, keywords);

    console.log('Calling DeepSeek API with template:', template_type);

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2048,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: `API error: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('DeepSeek API response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected API response structure:', data);
      return new Response(JSON.stringify({ error: 'Unexpected API response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const generatedContent = data.choices[0].message.content;
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
