import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

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
  const basePrompts: Record<string, string> = {
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
Do not provide multiple versions.`,

    'video-prompt': `You are an expert at creating detailed prompts for AI video generation tools. Create ONE comprehensive video prompt that includes:
- Detailed visual descriptions
- Camera movements and angles
- Lighting and mood
- Scene transitions
- Style references
Output only the video prompt, no explanations.`,

    'image-prompt': `You are an expert at creating detailed prompts for AI image generation. Create ONE comprehensive image prompt that includes:
- Subject description
- Style and artistic direction
- Lighting and atmosphere
- Composition details
- Technical specifications (aspect ratio, quality keywords)
Output only the image prompt, no explanations.`,

    'chatgpt-prompt': `You are an expert prompt engineer. Create ONE optimized ChatGPT prompt that:
- Is clear and specific
- Includes context and constraints
- Specifies desired output format
- Uses best practices for prompt engineering
Output only the prompt, no explanations.`,

    'hashtag': `You are a social media hashtag expert. Generate a curated list of 15-25 relevant hashtags that:
- Mix popular and niche hashtags
- Are optimized for discoverability
- Include trending and evergreen options
Output only the hashtags, no explanations.`,

    'post-ideas': `You are a content strategist. Generate 5-10 creative post ideas that:
- Are unique and engaging
- Include brief descriptions
- Have viral potential
Format as a numbered list with titles and brief descriptions.`
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openaiApiKey) {
      console.error('OpenAI API key not found');
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

    console.log('Calling OpenAI API with template:', template_type);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2048,
        temperature: template_type === 'humanize' ? 0.9 : 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'AI service rate limit exceeded. Please wait a moment and try again.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 401) {
        return new Response(JSON.stringify({ 
          error: 'Invalid API key. Please check your OpenAI API key configuration.' 
        }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ error: `API error: ${response.status}` }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    console.log('OpenAI API response received');

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
