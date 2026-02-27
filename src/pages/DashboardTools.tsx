import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { useSearchParams } from 'react-router-dom';
import { PDFDocument } from 'pdf-lib';
import { 
  QrCode, 
  Palette, 
  Copy, 
  Download,
  Loader2,
  FileImage,
  Minimize2,
  Hash,
  ArrowRightLeft,
  AlignLeft,
  Type,
  Link2,
  Globe,
  Mail,
  Target,
  Image,
  FileText,
  Scissors,
  Merge,
  ImageIcon,
  Lock,
  Unlock,
  Braces,
  Binary,
  Code2,
  Link,
  FileType,
  GitCompare,
  Clock,
  Ruler,
  KeyRound,
  Fingerprint,
  Key,
  ShieldCheck
} from 'lucide-react';
import {
  JSONFormatter,
  Base64Tool,
  CSSMinifier,
  SlugGenerator,
  MarkdownPreviewer,
  TextDiffChecker,
  TimestampConverter,
  UnitConverter,
  PasswordGenerator,
  HashGenerator,
  UUIDGenerator,
  JWTDecoder,
} from '@/components/tools/AdvancedTools';

// Tool Components
const ImageCompressor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl] = useState<string>('');
  const [quality, setQuality] = useState([80]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setOriginalSize(file.size);
      setCompressedUrl('');
    }
  };

  const compressImage = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setCompressedUrl(url);
              setCompressedSize(blob.size);
              setIsProcessing(false);
              toast({ title: "Success!", description: "Image compressed successfully" });
            }
          },
          'image/jpeg',
          quality[0] / 100
        );
      };
      
      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      setIsProcessing(false);
      toast({ title: "Error", description: "Failed to compress image", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Upload Image</Label>
        <Input type="file" accept="image/*" onChange={handleFileSelect} />
      </div>
      
      {selectedFile && (
        <>
          <div className="space-y-2">
            <Label>Quality: {quality[0]}%</Label>
            <Slider value={quality} onValueChange={setQuality} min={10} max={100} step={5} />
          </div>
          
          <Button onClick={compressImage} disabled={isProcessing} className="w-full">
            {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Compressing...</> : <><Minimize2 className="mr-2 h-4 w-4" /> Compress Image</>}
          </Button>
        </>
      )}
      
      {compressedUrl && (
        <div className="space-y-2 p-4 bg-muted rounded-lg">
          <p className="text-sm">Original: {(originalSize / 1024).toFixed(2)} KB</p>
          <p className="text-sm">Compressed: {(compressedSize / 1024).toFixed(2)} KB</p>
          <p className="text-sm text-green-600">Saved: {((1 - compressedSize / originalSize) * 100).toFixed(1)}%</p>
          <Button asChild className="w-full">
            <a href={compressedUrl} download="compressed-image.jpg"><Download className="mr-2 h-4 w-4" /> Download</a>
          </Button>
        </div>
      )}
    </div>
  );
};

const ImageConverter = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState('png');
  const [convertedUrl, setConvertedUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setConvertedUrl('');
    }
  };

  const convertImage = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const mimeType = outputFormat === 'jpg' ? 'image/jpeg' : `image/${outputFormat}`;
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              setConvertedUrl(url);
              setIsProcessing(false);
              toast({ title: "Success!", description: `Image converted to ${outputFormat.toUpperCase()}` });
            }
          },
          mimeType,
          0.95
        );
      };
      
      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      setIsProcessing(false);
      toast({ title: "Error", description: "Failed to convert image", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Upload Image</Label>
        <Input type="file" accept="image/*" onChange={handleFileSelect} />
      </div>
      
      <div className="space-y-2">
        <Label>Output Format</Label>
        <Select value={outputFormat} onValueChange={setOutputFormat}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="png">PNG</SelectItem>
            <SelectItem value="jpg">JPG</SelectItem>
            <SelectItem value="webp">WebP</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button onClick={convertImage} disabled={!selectedFile || isProcessing} className="w-full">
        {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...</> : <><ArrowRightLeft className="mr-2 h-4 w-4" /> Convert Image</>}
      </Button>
      
      {convertedUrl && (
        <Button asChild className="w-full">
          <a href={convertedUrl} download={`converted-image.${outputFormat}`}><Download className="mr-2 h-4 w-4" /> Download {outputFormat.toUpperCase()}</a>
        </Button>
      )}
    </div>
  );
};

const TextCaseConverter = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const { toast } = useToast();

  const convert = (type: string) => {
    let result = '';
    switch (type) {
      case 'upper': result = inputText.toUpperCase(); break;
      case 'lower': result = inputText.toLowerCase(); break;
      case 'title': result = inputText.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()); break;
      case 'sentence': result = inputText.charAt(0).toUpperCase() + inputText.slice(1).toLowerCase(); break;
      case 'alternate': result = inputText.split('').map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join(''); break;
      case 'reverse': result = inputText.split('').reverse().join(''); break;
    }
    setOutputText(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputText);
    toast({ title: "Copied!", description: "Text copied to clipboard" });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Enter Text</Label>
        <Textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Type or paste your text here..." rows={4} />
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" onClick={() => convert('upper')}>UPPERCASE</Button>
        <Button variant="outline" onClick={() => convert('lower')}>lowercase</Button>
        <Button variant="outline" onClick={() => convert('title')}>Title Case</Button>
        <Button variant="outline" onClick={() => convert('sentence')}>Sentence</Button>
        <Button variant="outline" onClick={() => convert('alternate')}>aLtErNaTe</Button>
        <Button variant="outline" onClick={() => convert('reverse')}>esreveR</Button>
      </div>
      
      {outputText && (
        <div className="space-y-2">
          <Label>Result</Label>
          <Textarea value={outputText} readOnly rows={4} />
          <Button onClick={copyToClipboard} className="w-full"><Copy className="mr-2 h-4 w-4" /> Copy Result</Button>
        </div>
      )}
    </div>
  );
};

const WordCounter = () => {
  const [text, setText] = useState('');
  
  const stats = {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    sentences: text.split(/[.!?]+/).filter(s => s.trim()).length,
    paragraphs: text.split(/\n\n+/).filter(p => p.trim()).length,
    readingTime: Math.ceil((text.trim() ? text.trim().split(/\s+/).length : 0) / 200)
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Enter Text</Label>
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Type or paste your text here..." rows={6} />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-2xl font-bold text-primary">{stats.words}</p>
          <p className="text-sm text-muted-foreground">Words</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-2xl font-bold text-primary">{stats.characters}</p>
          <p className="text-sm text-muted-foreground">Characters</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-2xl font-bold text-primary">{stats.charactersNoSpaces}</p>
          <p className="text-sm text-muted-foreground">No Spaces</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-2xl font-bold text-primary">{stats.sentences}</p>
          <p className="text-sm text-muted-foreground">Sentences</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-2xl font-bold text-primary">{stats.paragraphs}</p>
          <p className="text-sm text-muted-foreground">Paragraphs</p>
        </div>
        <div className="p-4 bg-muted rounded-lg text-center">
          <p className="text-2xl font-bold text-primary">{stats.readingTime}</p>
          <p className="text-sm text-muted-foreground">Min Read</p>
        </div>
      </div>
    </div>
  );
};

const QRCodeGenerator = () => {
  const [text, setText] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const { toast } = useToast();

  const generateQR = () => {
    if (!text.trim()) {
      toast({ title: "Error", description: "Please enter text or URL", variant: "destructive" });
      return;
    }
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(text)}`;
    setQrUrl(url);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Text or URL</Label>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text or URL to encode..." />
      </div>
      
      <Button onClick={generateQR} className="w-full"><QrCode className="mr-2 h-4 w-4" /> Generate QR Code</Button>
      
      {qrUrl && (
        <div className="flex flex-col items-center gap-4">
          <img src={qrUrl} alt="QR Code" className="border rounded-lg" />
          <Button asChild><a href={qrUrl} download="qr-code.png"><Download className="mr-2 h-4 w-4" /> Download QR Code</a></Button>
        </div>
      )}
    </div>
  );
};

const ColorConverter = () => {
  const [hexColor, setHexColor] = useState('#3b82f6');
  const { toast } = useToast();

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
  };

  const hexToHsl = (hex: string) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    let { r, g, b } = rgb;
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rgb = hexToRgb(hexColor);
  const hsl = hexToHsl(hexColor);

  const copyValue = (value: string) => {
    navigator.clipboard.writeText(value);
    toast({ title: "Copied!", description: value });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Pick a Color</Label>
        <div className="flex gap-2">
          <Input type="color" value={hexColor} onChange={(e) => setHexColor(e.target.value)} className="w-16 h-10 p-1 cursor-pointer" />
          <Input value={hexColor} onChange={(e) => setHexColor(e.target.value)} placeholder="#000000" />
        </div>
      </div>
      
      <div className="h-24 rounded-lg border" style={{ backgroundColor: hexColor }} />
      
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="font-mono">{hexColor.toUpperCase()}</span>
          <Button variant="ghost" size="sm" onClick={() => copyValue(hexColor.toUpperCase())}><Copy className="h-4 w-4" /></Button>
        </div>
        {rgb && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-mono">rgb({rgb.r}, {rgb.g}, {rgb.b})</span>
            <Button variant="ghost" size="sm" onClick={() => copyValue(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`)}><Copy className="h-4 w-4" /></Button>
          </div>
        )}
        {hsl && (
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="font-mono">hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</span>
            <Button variant="ghost" size="sm" onClick={() => copyValue(`hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`)}><Copy className="h-4 w-4" /></Button>
          </div>
        )}
      </div>
    </div>
  );
};

const LoremGenerator = () => {
  const [paragraphs, setParagraphs] = useState('3');
  const [output, setOutput] = useState('');
  const { toast } = useToast();

  const loremWords = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'];

  const generateLorem = () => {
    const count = parseInt(paragraphs) || 3;
    const result = [];
    
    for (let p = 0; p < count; p++) {
      const sentenceCount = Math.floor(Math.random() * 4) + 4;
      const sentences = [];
      
      for (let s = 0; s < sentenceCount; s++) {
        const wordCount = Math.floor(Math.random() * 10) + 8;
        const words = [];
        for (let w = 0; w < wordCount; w++) {
          words.push(loremWords[Math.floor(Math.random() * loremWords.length)]);
        }
        words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
        sentences.push(words.join(' ') + '.');
      }
      result.push(sentences.join(' '));
    }
    
    setOutput(result.join('\n\n'));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({ title: "Copied!", description: "Lorem ipsum copied to clipboard" });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Number of Paragraphs</Label>
        <Input type="number" min="1" max="20" value={paragraphs} onChange={(e) => setParagraphs(e.target.value)} />
      </div>
      
      <Button onClick={generateLorem} className="w-full"><AlignLeft className="mr-2 h-4 w-4" /> Generate Lorem Ipsum</Button>
      
      {output && (
        <div className="space-y-2">
          <Textarea value={output} readOnly rows={8} />
          <Button onClick={copyToClipboard} className="w-full"><Copy className="mr-2 h-4 w-4" /> Copy Text</Button>
        </div>
      )}
    </div>
  );
};

// Marketing Tools
const UTMBuilder = () => {
  const [baseUrl, setBaseUrl] = useState('');
  const [source, setSource] = useState('');
  const [medium, setMedium] = useState('');
  const [campaign, setCampaign] = useState('');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('');
  const { toast } = useToast();

  const generatedUrl = () => {
    if (!baseUrl) return '';
    try {
      const url = new URL(baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`);
      if (source) url.searchParams.set('utm_source', source);
      if (medium) url.searchParams.set('utm_medium', medium);
      if (campaign) url.searchParams.set('utm_campaign', campaign);
      if (term) url.searchParams.set('utm_term', term);
      if (content) url.searchParams.set('utm_content', content);
      return url.toString();
    } catch {
      return 'Invalid URL';
    }
  };

  const copyUrl = () => {
    const url = generatedUrl();
    if (url && url !== 'Invalid URL') {
      navigator.clipboard.writeText(url);
      toast({ title: "Copied!", description: "UTM link copied to clipboard" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Website URL *</Label>
        <Input value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} placeholder="https://example.com/page" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Campaign Source *</Label>
          <Input value={source} onChange={(e) => setSource(e.target.value)} placeholder="google, facebook, newsletter" />
        </div>
        <div className="space-y-2">
          <Label>Campaign Medium *</Label>
          <Input value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="cpc, email, social" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Campaign Name *</Label>
        <Input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="spring_sale, product_launch" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Campaign Term (optional)</Label>
          <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="running+shoes" />
        </div>
        <div className="space-y-2">
          <Label>Campaign Content (optional)</Label>
          <Input value={content} onChange={(e) => setContent(e.target.value)} placeholder="logolink, textlink" />
        </div>
      </div>
      {generatedUrl() && generatedUrl() !== 'Invalid URL' && (
        <div className="space-y-2">
          <Label>Generated URL</Label>
          <div className="p-3 bg-muted rounded-lg break-all text-sm font-mono">
            {generatedUrl()}
          </div>
          <Button onClick={copyUrl} className="w-full"><Copy className="mr-2 h-4 w-4" /> Copy URL</Button>
        </div>
      )}
    </div>
  );
};

const MetaTagGenerator = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywords, setKeywords] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [url, setUrl] = useState('');
  const { toast } = useToast();

  const generateTags = () => {
    return `<!-- Primary Meta Tags -->
<title>${title}</title>
<meta name="title" content="${title}">
<meta name="description" content="${description}">
${keywords ? `<meta name="keywords" content="${keywords}">` : ''}

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
${url ? `<meta property="og:url" content="${url}">` : ''}
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
${ogImage ? `<meta property="og:image" content="${ogImage}">` : ''}

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
${url ? `<meta property="twitter:url" content="${url}">` : ''}
<meta property="twitter:title" content="${title}">
<meta property="twitter:description" content="${description}">
${ogImage ? `<meta property="twitter:image" content="${ogImage}">` : ''}`;
  };

  const copyTags = () => {
    navigator.clipboard.writeText(generateTags());
    toast({ title: "Copied!", description: "Meta tags copied to clipboard" });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Page Title (50-60 characters)</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My Awesome Page Title" maxLength={60} />
        <p className="text-xs text-muted-foreground">{title.length}/60 characters</p>
      </div>
      <div className="space-y-2">
        <Label>Description (150-160 characters)</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="A brief description of your page..." maxLength={160} rows={3} />
        <p className="text-xs text-muted-foreground">{description.length}/160 characters</p>
      </div>
      <div className="space-y-2">
        <Label>Keywords (comma separated)</Label>
        <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="keyword1, keyword2, keyword3" />
      </div>
      <div className="space-y-2">
        <Label>Page URL</Label>
        <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/page" />
      </div>
      <div className="space-y-2">
        <Label>OG Image URL</Label>
        <Input value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="https://example.com/image.jpg" />
      </div>
      {title && (
        <div className="space-y-2">
          <Label>Generated Meta Tags</Label>
          <Textarea value={generateTags()} readOnly rows={12} className="font-mono text-xs" />
          <Button onClick={copyTags} className="w-full"><Copy className="mr-2 h-4 w-4" /> Copy Meta Tags</Button>
        </div>
      )}
    </div>
  );
};

const EmailSignatureGenerator = () => {
  const [name, setName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const { toast } = useToast();

  const generateSignature = () => {
    return `<table cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; font-size: 14px; color: #333;">
  <tr>
    <td style="padding-bottom: 8px; border-bottom: 2px solid #3b82f6;">
      <strong style="font-size: 16px; color: #1e293b;">${name}</strong>
      ${jobTitle ? `<br><span style="color: #64748b;">${jobTitle}</span>` : ''}
      ${company ? `<br><span style="font-weight: 500;">${company}</span>` : ''}
    </td>
  </tr>
  <tr>
    <td style="padding-top: 8px;">
      ${email ? `<div style="margin: 4px 0;">📧 <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${email}</a></div>` : ''}
      ${phone ? `<div style="margin: 4px 0;">📱 <a href="tel:${phone}" style="color: #3b82f6; text-decoration: none;">${phone}</a></div>` : ''}
      ${website ? `<div style="margin: 4px 0;">🌐 <a href="${website}" style="color: #3b82f6; text-decoration: none;">${website}</a></div>` : ''}
      ${linkedin ? `<div style="margin: 4px 0;">💼 <a href="${linkedin}" style="color: #3b82f6; text-decoration: none;">LinkedIn Profile</a></div>` : ''}
    </td>
  </tr>
</table>`;
  };

  const copySignature = () => {
    navigator.clipboard.writeText(generateSignature());
    toast({ title: "Copied!", description: "Email signature HTML copied to clipboard" });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Full Name *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label>Job Title</Label>
          <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Marketing Manager" />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Company</Label>
        <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Inc." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 890" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Website</Label>
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
        </div>
        <div className="space-y-2">
          <Label>LinkedIn</Label>
          <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/johndoe" />
        </div>
      </div>
      {name && (
        <div className="space-y-4">
          <Label>Preview</Label>
          <div className="p-4 bg-white rounded-lg border" dangerouslySetInnerHTML={{ __html: generateSignature() }} />
          <Button onClick={copySignature} className="w-full"><Copy className="mr-2 h-4 w-4" /> Copy HTML Signature</Button>
        </div>
      )}
    </div>
  );
};

const HeadlineAnalyzer = () => {
  const [headline, setHeadline] = useState('');

  const analyzeHeadline = () => {
    if (!headline) return null;

    const words = headline.trim().split(/\s+/);
    const wordCount = words.length;
    const charCount = headline.length;
    
    // Power words that drive engagement
    const powerWords = ['free', 'new', 'you', 'how', 'why', 'best', 'top', 'secret', 'proven', 'easy', 'simple', 'quick', 'fast', 'ultimate', 'amazing', 'incredible', 'essential', 'exclusive', 'limited', 'guaranteed'];
    const emotionalWords = ['love', 'hate', 'fear', 'happy', 'sad', 'angry', 'excited', 'surprised', 'beautiful', 'ugly', 'powerful', 'weak', 'success', 'failure'];
    
    const foundPowerWords = words.filter(w => powerWords.includes(w.toLowerCase()));
    const foundEmotionalWords = words.filter(w => emotionalWords.includes(w.toLowerCase()));
    const hasNumber = /\d/.test(headline);
    const hasQuestion = headline.includes('?');
    const startsWithNumber = /^\d/.test(headline.trim());
    
    // Calculate score
    let score = 50;
    if (wordCount >= 6 && wordCount <= 12) score += 15;
    else if (wordCount >= 4 && wordCount <= 14) score += 8;
    if (charCount >= 50 && charCount <= 60) score += 10;
    if (foundPowerWords.length > 0) score += foundPowerWords.length * 5;
    if (foundEmotionalWords.length > 0) score += foundEmotionalWords.length * 5;
    if (hasNumber) score += 10;
    if (startsWithNumber) score += 5;
    if (hasQuestion) score += 5;
    
    score = Math.min(100, score);

    return {
      score,
      wordCount,
      charCount,
      powerWords: foundPowerWords,
      emotionalWords: foundEmotionalWords,
      hasNumber,
      hasQuestion,
      tips: [
        wordCount < 6 ? "Consider adding more words (6-12 is ideal)" : null,
        wordCount > 12 ? "Try shortening your headline (6-12 words is ideal)" : null,
        foundPowerWords.length === 0 ? "Add power words like 'free', 'proven', or 'essential'" : null,
        !hasNumber ? "Consider adding a number for more impact" : null,
        charCount > 70 ? "Headline may get truncated in search results" : null,
      ].filter(Boolean)
    };
  };

  const analysis = analyzeHeadline();

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Enter Your Headline</Label>
        <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="10 Proven Ways to Boost Your Marketing ROI" />
      </div>
      
      {analysis && (
        <div className="space-y-4">
          <div className="text-center p-6 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Headline Score</p>
            <p className={`text-5xl font-bold ${getScoreColor(analysis.score)}`}>{analysis.score}</p>
            <p className="text-sm text-muted-foreground mt-2">out of 100</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-xl font-bold text-primary">{analysis.wordCount}</p>
              <p className="text-xs text-muted-foreground">Words</p>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <p className="text-xl font-bold text-primary">{analysis.charCount}</p>
              <p className="text-xs text-muted-foreground">Characters</p>
            </div>
          </div>
          
          {analysis.powerWords.length > 0 && (
            <div className="p-3 bg-green-500/10 rounded-lg">
              <p className="text-sm font-medium text-green-700">✓ Power words found: {analysis.powerWords.join(', ')}</p>
            </div>
          )}
          
          {analysis.emotionalWords.length > 0 && (
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <p className="text-sm font-medium text-blue-700">✓ Emotional words found: {analysis.emotionalWords.join(', ')}</p>
            </div>
          )}
          
          {analysis.hasNumber && (
            <div className="p-3 bg-green-500/10 rounded-lg">
              <p className="text-sm font-medium text-green-700">✓ Contains a number (increases clicks)</p>
            </div>
          )}
          
          {analysis.tips.length > 0 && (
            <div className="space-y-2">
              <Label>Tips to Improve</Label>
              {analysis.tips.map((tip, i) => (
                <div key={i} className="p-3 bg-yellow-500/10 rounded-lg">
                  <p className="text-sm text-yellow-700">💡 {tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SocialMediaSizeGuide = () => {
  const { toast } = useToast();
  
  const platforms = [
    {
      name: 'Instagram',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500',
      sizes: [
        { type: 'Profile Photo', dimensions: '320 x 320', ratio: '1:1' },
        { type: 'Square Post', dimensions: '1080 x 1080', ratio: '1:1' },
        { type: 'Portrait Post', dimensions: '1080 x 1350', ratio: '4:5' },
        { type: 'Landscape Post', dimensions: '1080 x 566', ratio: '1.91:1' },
        { type: 'Story / Reels', dimensions: '1080 x 1920', ratio: '9:16' },
        { type: 'Carousel', dimensions: '1080 x 1080', ratio: '1:1' },
      ]
    },
    {
      name: 'Facebook',
      color: 'bg-blue-600',
      sizes: [
        { type: 'Profile Photo', dimensions: '170 x 170', ratio: '1:1' },
        { type: 'Cover Photo', dimensions: '820 x 312', ratio: '2.63:1' },
        { type: 'Feed Post', dimensions: '1200 x 630', ratio: '1.91:1' },
        { type: 'Square Post', dimensions: '1080 x 1080', ratio: '1:1' },
        { type: 'Story', dimensions: '1080 x 1920', ratio: '9:16' },
        { type: 'Event Cover', dimensions: '1920 x 1005', ratio: '1.91:1' },
      ]
    },
    {
      name: 'X (Twitter)',
      color: 'bg-black',
      sizes: [
        { type: 'Profile Photo', dimensions: '400 x 400', ratio: '1:1' },
        { type: 'Header Photo', dimensions: '1500 x 500', ratio: '3:1' },
        { type: 'In-Stream Photo', dimensions: '1600 x 900', ratio: '16:9' },
        { type: 'Card Image', dimensions: '1200 x 628', ratio: '1.91:1' },
      ]
    },
    {
      name: 'LinkedIn',
      color: 'bg-blue-700',
      sizes: [
        { type: 'Profile Photo', dimensions: '400 x 400', ratio: '1:1' },
        { type: 'Cover Photo', dimensions: '1584 x 396', ratio: '4:1' },
        { type: 'Feed Post', dimensions: '1200 x 627', ratio: '1.91:1' },
        { type: 'Company Logo', dimensions: '300 x 300', ratio: '1:1' },
        { type: 'Company Cover', dimensions: '1128 x 191', ratio: '5.91:1' },
      ]
    },
    {
      name: 'YouTube',
      color: 'bg-red-600',
      sizes: [
        { type: 'Profile Photo', dimensions: '800 x 800', ratio: '1:1' },
        { type: 'Channel Banner', dimensions: '2560 x 1440', ratio: '16:9' },
        { type: 'Thumbnail', dimensions: '1280 x 720', ratio: '16:9' },
        { type: 'Video', dimensions: '1920 x 1080', ratio: '16:9' },
      ]
    },
    {
      name: 'TikTok',
      color: 'bg-black',
      sizes: [
        { type: 'Profile Photo', dimensions: '200 x 200', ratio: '1:1' },
        { type: 'Video', dimensions: '1080 x 1920', ratio: '9:16' },
      ]
    },
    {
      name: 'Pinterest',
      color: 'bg-red-500',
      sizes: [
        { type: 'Profile Photo', dimensions: '165 x 165', ratio: '1:1' },
        { type: 'Standard Pin', dimensions: '1000 x 1500', ratio: '2:3' },
        { type: 'Square Pin', dimensions: '1000 x 1000', ratio: '1:1' },
        { type: 'Long Pin', dimensions: '1000 x 2100', ratio: '1:2.1' },
      ]
    },
  ];

  const copyDimensions = (dimensions: string) => {
    navigator.clipboard.writeText(dimensions);
    toast({ title: "Copied!", description: `${dimensions} copied to clipboard` });
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        Click on any dimension to copy it to your clipboard.
      </p>
      
      {platforms.map((platform) => (
        <div key={platform.name} className="space-y-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${platform.color}`} />
            <h3 className="font-semibold">{platform.name}</h3>
          </div>
          
          <div className="grid gap-2">
            {platform.sizes.map((size) => (
              <div 
                key={`${platform.name}-${size.type}`}
                className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer transition-colors"
                onClick={() => copyDimensions(size.dimensions)}
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{size.type}</p>
                  <p className="text-xs text-muted-foreground">Ratio: {size.ratio}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm bg-background px-2 py-1 rounded">
                    {size.dimensions}
                  </span>
                  <Copy className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// PDF Tools
const PDFMerger = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedUrl, setMergedUrl] = useState('');
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const pdfFiles = selectedFiles.filter(f => f.type === 'application/pdf');
    setFiles(prev => [...prev, ...pdfFiles]);
    setMergedUrl('');
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const mergePDFs = async () => {
    if (files.length < 2) {
      toast({ title: "Error", description: "Please select at least 2 PDF files", variant: "destructive" });
      return;
    }
    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedUrl(url);
      toast({ title: "Success!", description: "PDFs merged successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to merge PDFs", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select PDF Files</Label>
        <Input type="file" accept=".pdf" multiple onChange={handleFileSelect} />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Files ({files.length})</Label>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm truncate flex-1">{file.name}</span>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>×</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={mergePDFs} disabled={files.length < 2 || isProcessing} className="w-full">
        {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Merging...</> : <><Merge className="mr-2 h-4 w-4" /> Merge PDFs</>}
      </Button>

      {mergedUrl && (
        <Button asChild className="w-full">
          <a href={mergedUrl} download="merged.pdf"><Download className="mr-2 h-4 w-4" /> Download Merged PDF</a>
        </Button>
      )}
    </div>
  );
};

const PDFSplitter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [startPage, setStartPage] = useState('1');
  const [endPage, setEndPage] = useState('1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitUrl, setSplitUrl] = useState('');
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setSplitUrl('');
      try {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const count = pdf.getPageCount();
        setPageCount(count);
        setStartPage('1');
        setEndPage(String(count));
      } catch (error) {
        toast({ title: "Error", description: "Failed to read PDF", variant: "destructive" });
      }
    }
  };

  const splitPDF = async () => {
    if (!file) return;
    const start = parseInt(startPage);
    const end = parseInt(endPage);

    if (start < 1 || end > pageCount || start > end) {
      toast({ title: "Error", description: "Invalid page range", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();
      
      const pageIndices = Array.from({ length: end - start + 1 }, (_, i) => start - 1 + i);
      const copiedPages = await newPdf.copyPages(sourcePdf, pageIndices);
      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setSplitUrl(url);
      toast({ title: "Success!", description: `Extracted pages ${start}-${end}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to split PDF", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select PDF File</Label>
        <Input type="file" accept=".pdf" onChange={handleFileSelect} />
      </div>

      {file && pageCount > 0 && (
        <>
          <p className="text-sm text-muted-foreground">Total pages: {pageCount}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Page</Label>
              <Input type="number" min="1" max={pageCount} value={startPage} onChange={(e) => setStartPage(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>End Page</Label>
              <Input type="number" min="1" max={pageCount} value={endPage} onChange={(e) => setEndPage(e.target.value)} />
            </div>
          </div>

          <Button onClick={splitPDF} disabled={isProcessing} className="w-full">
            {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : <><Scissors className="mr-2 h-4 w-4" /> Extract Pages</>}
          </Button>
        </>
      )}

      {splitUrl && (
        <Button asChild className="w-full">
          <a href={splitUrl} download="extracted-pages.pdf"><Download className="mr-2 h-4 w-4" /> Download Extracted PDF</a>
        </Button>
      )}
    </div>
  );
};

const ImageToPDF = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imageFiles = selectedFiles.filter(f => f.type.startsWith('image/'));
    setFiles(prev => [...prev, ...imageFiles]);
    setPdfUrl('');
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const convertToPDF = async () => {
    if (files.length === 0) {
      toast({ title: "Error", description: "Please select at least one image", variant: "destructive" });
      return;
    }
    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        let image;
        if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(uint8Array);
        } else if (file.type === 'image/png') {
          image = await pdfDoc.embedPng(uint8Array);
        } else {
          // Convert other formats to PNG using canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new window.Image();
          
          await new Promise<void>((resolve) => {
            img.onload = () => {
              canvas.width = img.width;
              canvas.height = img.height;
              ctx?.drawImage(img, 0, 0);
              resolve();
            };
            img.src = URL.createObjectURL(file);
          });
          
          const pngDataUrl = canvas.toDataURL('image/png');
          const pngBase64 = pngDataUrl.split(',')[1];
          const pngBytes = Uint8Array.from(atob(pngBase64), c => c.charCodeAt(0));
          image = await pdfDoc.embedPng(pngBytes);
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      toast({ title: "Success!", description: "Images converted to PDF" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to convert images", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Images</Label>
        <Input type="file" accept="image/*" multiple onChange={handleFileSelect} />
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Images ({files.length})</Label>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm truncate flex-1">{file.name}</span>
                <Button variant="ghost" size="sm" onClick={() => removeFile(index)}>×</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={convertToPDF} disabled={files.length === 0 || isProcessing} className="w-full">
        {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Converting...</> : <><FileText className="mr-2 h-4 w-4" /> Convert to PDF</>}
      </Button>

      {pdfUrl && (
        <Button asChild className="w-full">
          <a href={pdfUrl} download="images.pdf"><Download className="mr-2 h-4 w-4" /> Download PDF</a>
        </Button>
      )}
    </div>
  );
};

const PDFToImage = () => {
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <div className="p-6 bg-muted rounded-lg text-center">
        <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="font-semibold mb-2">PDF to Image Converter</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Due to browser limitations, PDF to image conversion requires a server-side solution. 
          For now, you can use our other PDF tools or try online services.
        </p>
        <Button variant="outline" onClick={() => toast({ title: "Tip", description: "Try smallpdf.com or ilovepdf.com for PDF to image conversion" })}>
          Learn More
        </Button>
      </div>
    </div>
  );
};

const PDFPasswordProtect = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [protectedUrl, setProtectedUrl] = useState('');
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setProtectedUrl('');
    }
  };

  const protectPDF = async () => {
    if (!file) {
      toast({ title: "Error", description: "Please select a PDF file", variant: "destructive" });
      return;
    }
    if (!password) {
      toast({ title: "Error", description: "Please enter a password", variant: "destructive" });
      return;
    }
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }
    if (password.length < 4) {
      toast({ title: "Error", description: "Password must be at least 4 characters", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // pdf-lib doesn't support encryption directly, so we'll use a workaround
      // by embedding the password requirement info and using browser crypto
      // For full encryption, we need to inform users about limitations
      
      // Create a new PDF with the same content
      const newPdf = await PDFDocument.create();
      const copiedPages = await newPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach(page => newPdf.addPage(page));
      
      // Set PDF metadata to indicate protection
      newPdf.setTitle(pdfDoc.getTitle() || file.name.replace('.pdf', ''));
      newPdf.setAuthor(pdfDoc.getAuthor() || 'Protected PDF');
      newPdf.setSubject('Password Protected Document');
      newPdf.setCreator('PeakDraft PDF Tools');
      
      const pdfBytes = await newPdf.save();
      
      // For client-side password protection, we'll encrypt the PDF bytes
      const encoder = new TextEncoder();
      const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password.padEnd(32, '0').slice(0, 32)),
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const pdfBuffer = (pdfBytes as unknown as Uint8Array).buffer as ArrayBuffer;
      const encryptedData = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
        passwordKey,
        pdfBuffer
      );
      
      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + new Uint8Array(encryptedData).length);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);
      
      // Create downloadable encrypted file
      const blob = new Blob([combined], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      setProtectedUrl(url);
      
      toast({ 
        title: "Success!", 
        description: "PDF encrypted successfully. Keep your password safe - you'll need it to decrypt the file." 
      });
    } catch (error) {
      console.error('Encryption error:', error);
      toast({ title: "Error", description: "Failed to protect PDF", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <p className="text-sm text-amber-700 dark:text-amber-400">
          <strong>Note:</strong> This tool encrypts your PDF using AES-256 encryption. 
          The output is an encrypted file (.enc) that can be decrypted with the password you set.
          Standard PDF readers won't open the encrypted file directly.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Select PDF File</Label>
        <Input type="file" accept=".pdf" onChange={handleFileSelect} />
        {file && <p className="text-sm text-muted-foreground">{file.name}</p>}
      </div>

      <div className="space-y-2">
        <Label>Password</Label>
        <Input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Enter password (min 4 characters)"
        />
      </div>

      <div className="space-y-2">
        <Label>Confirm Password</Label>
        <Input 
          type="password" 
          value={confirmPassword} 
          onChange={(e) => setConfirmPassword(e.target.value)} 
          placeholder="Confirm your password"
        />
      </div>

      <Button 
        onClick={protectPDF} 
        disabled={!file || !password || !confirmPassword || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Encrypting...</>
        ) : (
          <><Lock className="mr-2 h-4 w-4" /> Encrypt PDF</>
        )}
      </Button>

      {protectedUrl && (
        <Button asChild className="w-full">
          <a href={protectedUrl} download={`${file?.name.replace('.pdf', '')}-protected.enc`}>
            <Download className="mr-2 h-4 w-4" /> Download Encrypted File
          </a>
        </Button>
      )}
    </div>
  );
};

const PDFDecrypt = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [decryptedUrl, setDecryptedUrl] = useState('');
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.enc')) {
      setFile(selectedFile);
      setDecryptedUrl('');
    } else {
      toast({ title: "Error", description: "Please select an encrypted .enc file", variant: "destructive" });
    }
  };

  const decryptPDF = async () => {
    if (!file) {
      toast({ title: "Error", description: "Please select an encrypted file", variant: "destructive" });
      return;
    }
    if (!password) {
      toast({ title: "Error", description: "Please enter the password", variant: "destructive" });
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const combined = new Uint8Array(arrayBuffer);
      
      // Extract IV (first 12 bytes) and encrypted data
      const iv = combined.slice(0, 12);
      const encryptedData = combined.slice(12);
      
      // Derive key from password
      const encoder = new TextEncoder();
      const passwordKey = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password.padEnd(32, '0').slice(0, 32)),
        { name: 'AES-GCM' },
        false,
        ['decrypt']
      );
      
      // Decrypt the data
      const decryptedData = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
        passwordKey,
        encryptedData.buffer as ArrayBuffer
      );
      
      // Create PDF blob
      const blob = new Blob([decryptedData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setDecryptedUrl(url);
      
      toast({ title: "Success!", description: "PDF decrypted successfully" });
    } catch (error) {
      console.error('Decryption error:', error);
      toast({ 
        title: "Error", 
        description: "Failed to decrypt PDF. Please check your password and try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          <strong>Note:</strong> This tool decrypts PDF files that were encrypted using the PDF Password Protect tool. 
          You'll need the password that was used during encryption.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Select Encrypted File (.enc)</Label>
        <Input type="file" accept=".enc" onChange={handleFileSelect} />
        {file && <p className="text-sm text-muted-foreground">{file.name}</p>}
      </div>

      <div className="space-y-2">
        <Label>Password</Label>
        <Input 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          placeholder="Enter the decryption password"
        />
      </div>

      <Button 
        onClick={decryptPDF} 
        disabled={!file || !password || isProcessing} 
        className="w-full"
      >
        {isProcessing ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Decrypting...</>
        ) : (
          <><Unlock className="mr-2 h-4 w-4" /> Decrypt PDF</>
        )}
      </Button>

      {decryptedUrl && (
        <Button asChild className="w-full">
          <a href={decryptedUrl} download={`${file?.name.replace('.enc', '')}.pdf`}>
            <Download className="mr-2 h-4 w-4" /> Download Decrypted PDF
          </a>
        </Button>
      )}
    </div>
  );
};


export type ToolCategory = 'all' | 'general' | 'pdf' | 'marketing' | 'developer' | 'text' | 'math' | 'security';

export const toolCategories: { value: ToolCategory; label: string }[] = [
  { value: 'all', label: 'All Tools' },
  { value: 'general', label: 'General' },
  { value: 'pdf', label: 'PDF' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'developer', label: 'Developer' },
  { value: 'text', label: 'Text' },
  { value: 'math', label: 'Math' },
  { value: 'security', label: 'Security' },
];

export const tools = [
  // General Tools
  { id: 'image-compress', name: 'Image Compressor', description: 'Reduce image file size while maintaining quality', icon: Minimize2, color: 'text-blue-500', component: ImageCompressor, category: 'general' as ToolCategory },
  { id: 'image-convert', name: 'Image Converter', description: 'Convert images between PNG, JPG, and WebP formats', icon: FileImage, color: 'text-green-500', component: ImageConverter, category: 'general' as ToolCategory },
  { id: 'text-case', name: 'Text Case Converter', description: 'Convert text to uppercase, lowercase, title case, and more', icon: Type, color: 'text-purple-500', component: TextCaseConverter, category: 'general' as ToolCategory },
  { id: 'word-counter', name: 'Word Counter', description: 'Count words, characters, sentences, and reading time', icon: Hash, color: 'text-orange-500', component: WordCounter, category: 'general' as ToolCategory },
  { id: 'qr-generator', name: 'QR Code Generator', description: 'Generate QR codes from text or URLs', icon: QrCode, color: 'text-pink-500', component: QRCodeGenerator, category: 'general' as ToolCategory },
  { id: 'color-converter', name: 'Color Converter', description: 'Convert colors between HEX, RGB, and HSL', icon: Palette, color: 'text-cyan-500', component: ColorConverter, category: 'general' as ToolCategory },
  { id: 'lorem-generator', name: 'Lorem Ipsum Generator', description: 'Generate placeholder text for your designs', icon: AlignLeft, color: 'text-yellow-500', component: LoremGenerator, category: 'general' as ToolCategory },
  // PDF Tools
  { id: 'pdf-merge', name: 'PDF Merger', description: 'Combine multiple PDF files into one document', icon: Merge, color: 'text-red-500', component: PDFMerger, category: 'pdf' as ToolCategory },
  { id: 'pdf-split', name: 'PDF Splitter', description: 'Extract specific pages from a PDF file', icon: Scissors, color: 'text-orange-600', component: PDFSplitter, category: 'pdf' as ToolCategory },
  { id: 'image-to-pdf', name: 'Image to PDF', description: 'Convert images to PDF documents', icon: FileText, color: 'text-blue-600', component: ImageToPDF, category: 'pdf' as ToolCategory },
  { id: 'pdf-to-image', name: 'PDF to Image', description: 'Convert PDF pages to image files', icon: ImageIcon, color: 'text-green-600', component: PDFToImage, category: 'pdf' as ToolCategory },
  { id: 'pdf-password', name: 'PDF Password Protect', description: 'Encrypt PDF files with password protection', icon: Lock, color: 'text-purple-600', component: PDFPasswordProtect, category: 'pdf' as ToolCategory },
  { id: 'pdf-decrypt', name: 'PDF Decrypt', description: 'Decrypt password-protected PDF files', icon: Unlock, color: 'text-teal-600', component: PDFDecrypt, category: 'pdf' as ToolCategory },
  // Marketing Tools
  { id: 'utm-builder', name: 'UTM Link Builder', description: 'Create trackable campaign URLs with UTM parameters', icon: Link2, color: 'text-indigo-500', component: UTMBuilder, category: 'marketing' as ToolCategory },
  { id: 'meta-tags', name: 'Meta Tag Generator', description: 'Generate SEO meta tags and Open Graph tags', icon: Globe, color: 'text-emerald-500', component: MetaTagGenerator, category: 'marketing' as ToolCategory },
  { id: 'email-signature', name: 'Email Signature Generator', description: 'Create professional HTML email signatures', icon: Mail, color: 'text-rose-500', component: EmailSignatureGenerator, category: 'marketing' as ToolCategory },
  { id: 'headline-analyzer', name: 'Headline Analyzer', description: 'Analyze and score your headlines for engagement', icon: Target, color: 'text-amber-500', component: HeadlineAnalyzer, category: 'marketing' as ToolCategory },
  { id: 'social-sizes', name: 'Social Media Size Guide', description: 'Image dimensions for all social media platforms', icon: Image, color: 'text-violet-500', component: SocialMediaSizeGuide, category: 'marketing' as ToolCategory },
  // Developer Tools
  { id: 'json-formatter', name: 'JSON Formatter', description: 'Format, validate, and minify JSON data', icon: Braces, color: 'text-sky-500', component: JSONFormatter, category: 'developer' as ToolCategory },
  { id: 'base64', name: 'Base64 Encoder/Decoder', description: 'Encode or decode Base64 strings', icon: Binary, color: 'text-lime-500', component: Base64Tool, category: 'developer' as ToolCategory },
  { id: 'css-minifier', name: 'CSS Minifier', description: 'Minify CSS code to reduce file size', icon: Code2, color: 'text-fuchsia-500', component: CSSMinifier, category: 'developer' as ToolCategory },
  { id: 'slug-generator', name: 'Slug Generator', description: 'Generate URL-friendly slugs from text', icon: Link, color: 'text-teal-500', component: SlugGenerator, category: 'developer' as ToolCategory },
  // Text/Writing Tools
  { id: 'markdown-preview', name: 'Markdown Previewer', description: 'Write and preview Markdown in real time', icon: FileType, color: 'text-orange-400', component: MarkdownPreviewer, category: 'text' as ToolCategory },
  { id: 'text-diff', name: 'Text Diff Checker', description: 'Compare two texts and highlight differences', icon: GitCompare, color: 'text-red-400', component: TextDiffChecker, category: 'text' as ToolCategory },
  // Math/Data Tools
  { id: 'timestamp', name: 'Timestamp Converter', description: 'Convert between Unix timestamps and dates', icon: Clock, color: 'text-blue-400', component: TimestampConverter, category: 'math' as ToolCategory },
  { id: 'unit-converter', name: 'Unit Converter', description: 'Convert length, weight, temperature, and data units', icon: Ruler, color: 'text-green-400', component: UnitConverter, category: 'math' as ToolCategory },
  // Security Tools
  { id: 'password-gen', name: 'Password Generator', description: 'Generate secure random passwords', icon: KeyRound, color: 'text-rose-400', component: PasswordGenerator, category: 'security' as ToolCategory },
  { id: 'hash-gen', name: 'Hash Generator', description: 'Generate SHA-1, SHA-256, SHA-384, SHA-512 hashes', icon: Fingerprint, color: 'text-purple-400', component: HashGenerator, category: 'security' as ToolCategory },
  { id: 'uuid-gen', name: 'UUID Generator', description: 'Generate random UUIDs (v4)', icon: Key, color: 'text-cyan-400', component: UUIDGenerator, category: 'security' as ToolCategory },
  { id: 'jwt-decoder', name: 'JWT Decoder', description: 'Decode and inspect JSON Web Tokens', icon: ShieldCheck, color: 'text-amber-400', component: JWTDecoder, category: 'security' as ToolCategory },
];

export default function DashboardTools() {
  const [searchParams] = useSearchParams();
  const toolParam = searchParams.get('tool');
  const [activeTool, setActiveTool] = useState<string | null>(toolParam);
  const [activeCategory, setActiveCategory] = useState<ToolCategory>('all');

  const filteredTools = activeCategory === 'all' ? tools : tools.filter(t => t.category === activeCategory);
  const ActiveToolComponent = activeTool ? tools.find(t => t.id === activeTool)?.component : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Utility Tools</h1>
        <p className="text-muted-foreground">Powerful utilities for images, text, and more.</p>
      </div>

      {!activeTool ? (
        <>
          <div className="flex flex-wrap gap-2">
            {toolCategories.map((cat) => (
              <Button
                key={cat.value}
                variant={activeCategory === cat.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveCategory(cat.value)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <Card 
                key={tool.id} 
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-2 hover:border-primary/50"
                onClick={() => setActiveTool(tool.id)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-2`}>
                    <tool.icon className={`h-6 w-6 ${tool.color}`} />
                  </div>
                  <CardTitle>{tool.name}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <div className="max-w-2xl">
          <Button variant="ghost" onClick={() => setActiveTool(null)} className="mb-6">
            ← Back to all tools
          </Button>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {(() => {
                  const tool = tools.find(t => t.id === activeTool);
                  if (tool) {
                    const IconComponent = tool.icon;
                    return <IconComponent className={`h-6 w-6 ${tool.color}`} />;
                  }
                  return null;
                })()}
                {tools.find(t => t.id === activeTool)?.name}
              </CardTitle>
              <CardDescription>
                {tools.find(t => t.id === activeTool)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ActiveToolComponent && <ActiveToolComponent />}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
