import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Copy, Download, Loader2 } from 'lucide-react';

// ─── Developer Tools ───

export const JSONFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const { toast } = useToast();

  const format = (indent: number) => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError('');
    } catch (e: any) {
      setError(e.message);
      setOutput('');
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
    } catch (e: any) {
      setError(e.message);
      setOutput('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Paste JSON</Label>
        <Textarea value={input} onChange={e => setInput(e.target.value)} placeholder='{"key": "value"}' rows={6} className="font-mono text-sm" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button onClick={() => format(2)} className="flex-1">Format (2 spaces)</Button>
        <Button onClick={() => format(4)} variant="outline" className="flex-1">Format (4 spaces)</Button>
        <Button onClick={minify} variant="outline" className="flex-1">Minify</Button>
      </div>
      {output && (
        <div className="space-y-2">
          <Textarea value={output} readOnly rows={8} className="font-mono text-sm" />
          <Button onClick={() => { navigator.clipboard.writeText(output); toast({ title: "Copied!" }); }} className="w-full">
            <Copy className="mr-2 h-4 w-4" /> Copy Result
          </Button>
        </div>
      )}
    </div>
  );
};

export const Base64Tool = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { toast } = useToast();

  const encode = () => {
    try { setOutput(btoa(unescape(encodeURIComponent(input)))); } catch { setOutput('Invalid input'); }
  };
  const decode = () => {
    try { setOutput(decodeURIComponent(escape(atob(input)))); } catch { setOutput('Invalid Base64 string'); }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Input</Label>
        <Textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text or Base64 string..." rows={4} className="font-mono text-sm" />
      </div>
      <div className="flex gap-2">
        <Button onClick={encode} className="flex-1">Encode</Button>
        <Button onClick={decode} variant="outline" className="flex-1">Decode</Button>
      </div>
      {output && (
        <div className="space-y-2">
          <Textarea value={output} readOnly rows={4} className="font-mono text-sm" />
          <Button onClick={() => { navigator.clipboard.writeText(output); toast({ title: "Copied!" }); }} className="w-full">
            <Copy className="mr-2 h-4 w-4" /> Copy
          </Button>
        </div>
      )}
    </div>
  );
};

export const CSSMinifier = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [savedPercent, setSavedPercent] = useState(0);
  const { toast } = useToast();

  const minify = () => {
    let css = input;
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    css = css.replace(/\s+/g, ' ');
    css = css.replace(/\s*([{}:;,>~+])\s*/g, '$1');
    css = css.replace(/;}/g, '}');
    css = css.trim();
    setOutput(css);
    setSavedPercent(input.length ? Math.round((1 - css.length / input.length) * 100) : 0);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Paste CSS</Label>
        <Textarea value={input} onChange={e => setInput(e.target.value)} placeholder=".class { color: red; }" rows={6} className="font-mono text-sm" />
      </div>
      <Button onClick={minify} className="w-full">Minify CSS</Button>
      {output && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Saved {savedPercent}% ({input.length} → {output.length} chars)</p>
          <Textarea value={output} readOnly rows={4} className="font-mono text-sm" />
          <Button onClick={() => { navigator.clipboard.writeText(output); toast({ title: "Copied!" }); }} className="w-full">
            <Copy className="mr-2 h-4 w-4" /> Copy Minified CSS
          </Button>
        </div>
      )}
    </div>
  );
};

export const SlugGenerator = () => {
  const [input, setInput] = useState('');
  const { toast } = useToast();

  const slug = input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Enter Title or Text</Label>
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder="My Awesome Blog Post!" />
      </div>
      {slug && (
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <span className="font-mono text-sm">{slug}</span>
          <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(slug); toast({ title: "Copied!" }); }}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

// ─── Text / Writing Tools ───

export const MarkdownPreviewer = () => {
  const [md, setMd] = useState('# Hello World\n\nThis is **bold** and *italic* text.\n\n- Item 1\n- Item 2\n\n> A blockquote\n\n`inline code`');

  const renderMarkdown = (text: string) => {
    let html = text
      .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-4 mb-2">$1</h2>')
      .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-4 mb-2">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/^> (.+)$/gm, '<blockquote class="border-l-4 border-primary/50 pl-4 italic text-muted-foreground my-2">$1</blockquote>')
      .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
      .replace(/\n{2,}/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
    return html;
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Markdown Input</Label>
          <Textarea value={md} onChange={e => setMd(e.target.value)} rows={12} className="font-mono text-sm" />
        </div>
        <div className="space-y-2">
          <Label>Preview</Label>
          <div
            className="p-4 border rounded-lg min-h-[280px] prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(md) }}
          />
        </div>
      </div>
    </div>
  );
};

export const TextDiffChecker = () => {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [diff, setDiff] = useState<{ type: 'same' | 'added' | 'removed'; line: string }[]>([]);

  const compare = () => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLen = Math.max(lines1.length, lines2.length);
    const result: typeof diff = [];

    for (let i = 0; i < maxLen; i++) {
      const l1 = lines1[i];
      const l2 = lines2[i];
      if (l1 === l2) {
        result.push({ type: 'same', line: l1 || '' });
      } else {
        if (l1 !== undefined) result.push({ type: 'removed', line: l1 });
        if (l2 !== undefined) result.push({ type: 'added', line: l2 });
      }
    }
    setDiff(result);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Original Text</Label>
          <Textarea value={text1} onChange={e => setText1(e.target.value)} rows={8} placeholder="Paste original text..." />
        </div>
        <div className="space-y-2">
          <Label>Modified Text</Label>
          <Textarea value={text2} onChange={e => setText2(e.target.value)} rows={8} placeholder="Paste modified text..." />
        </div>
      </div>
      <Button onClick={compare} className="w-full">Compare</Button>
      {diff.length > 0 && (
        <div className="p-4 bg-muted rounded-lg font-mono text-sm space-y-0.5 max-h-80 overflow-auto">
          {diff.map((d, i) => (
            <div
              key={i}
              className={`px-2 py-0.5 rounded ${
                d.type === 'added' ? 'bg-green-500/20 text-green-700 dark:text-green-400' :
                d.type === 'removed' ? 'bg-red-500/20 text-red-700 dark:text-red-400' : ''
              }`}
            >
              {d.type === 'added' ? '+ ' : d.type === 'removed' ? '- ' : '  '}{d.line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Math / Data Tools ───

export const TimestampConverter = () => {
  const [timestamp, setTimestamp] = useState('');
  const [dateStr, setDateStr] = useState('');
  const { toast } = useToast();

  const now = () => {
    const ts = Math.floor(Date.now() / 1000);
    setTimestamp(String(ts));
    setDateStr(new Date(ts * 1000).toISOString());
  };

  const fromTimestamp = () => {
    const num = Number(timestamp);
    if (isNaN(num)) return;
    const ms = timestamp.length > 10 ? num : num * 1000;
    setDateStr(new Date(ms).toISOString());
  };

  const fromDate = () => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return;
    setTimestamp(String(Math.floor(d.getTime() / 1000)));
  };

  return (
    <div className="space-y-4">
      <Button onClick={now} variant="outline" className="w-full">Use Current Time</Button>
      <div className="space-y-2">
        <Label>Unix Timestamp (seconds)</Label>
        <div className="flex gap-2">
          <Input value={timestamp} onChange={e => setTimestamp(e.target.value)} placeholder="1609459200" className="font-mono" />
          <Button onClick={fromTimestamp}>→ Date</Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label>ISO Date String</Label>
        <div className="flex gap-2">
          <Input value={dateStr} onChange={e => setDateStr(e.target.value)} placeholder="2021-01-01T00:00:00.000Z" className="font-mono" />
          <Button onClick={fromDate}>→ Timestamp</Button>
        </div>
      </div>
      {timestamp && dateStr && (
        <div className="p-4 bg-muted rounded-lg space-y-1 text-sm font-mono">
          <p>Unix: {timestamp}</p>
          <p>ISO: {dateStr}</p>
          <p>Local: {new Date(dateStr).toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export const UnitConverter = () => {
  const [value, setValue] = useState('1');
  const [category, setCategory] = useState('length');

  const conversions: Record<string, { name: string; units: { label: string; factor: number }[] }> = {
    length: {
      name: 'Length',
      units: [
        { label: 'Meters', factor: 1 },
        { label: 'Kilometers', factor: 0.001 },
        { label: 'Miles', factor: 0.000621371 },
        { label: 'Feet', factor: 3.28084 },
        { label: 'Inches', factor: 39.3701 },
        { label: 'Centimeters', factor: 100 },
      ],
    },
    weight: {
      name: 'Weight',
      units: [
        { label: 'Kilograms', factor: 1 },
        { label: 'Grams', factor: 1000 },
        { label: 'Pounds', factor: 2.20462 },
        { label: 'Ounces', factor: 35.274 },
      ],
    },
    temperature: {
      name: 'Temperature',
      units: [], // handled specially
    },
    data: {
      name: 'Data',
      units: [
        { label: 'Bytes', factor: 1 },
        { label: 'KB', factor: 1 / 1024 },
        { label: 'MB', factor: 1 / (1024 ** 2) },
        { label: 'GB', factor: 1 / (1024 ** 3) },
        { label: 'TB', factor: 1 / (1024 ** 4) },
      ],
    },
  };

  const num = parseFloat(value) || 0;

  const getResults = () => {
    if (category === 'temperature') {
      return [
        { label: 'Celsius', value: num },
        { label: 'Fahrenheit', value: (num * 9) / 5 + 32 },
        { label: 'Kelvin', value: num + 273.15 },
      ];
    }
    const cat = conversions[category];
    return cat.units.map(u => ({ label: u.label, value: num * u.factor }));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(conversions).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>{category === 'temperature' ? 'Value in Celsius' : `Value in ${conversions[category].units[0]?.label}`}</Label>
        <Input type="number" value={value} onChange={e => setValue(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {getResults().map(r => (
          <div key={r.label} className="p-3 bg-muted rounded-lg text-center">
            <p className="text-lg font-bold text-primary">{r.value.toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
            <p className="text-xs text-muted-foreground">{r.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Security Tools ───

export const PasswordGenerator = () => {
  const [length, setLength] = useState([16]);
  const [includeUpper, setIncludeUpper] = useState(true);
  const [includeLower, setIncludeLower] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const generate = () => {
    let chars = '';
    if (includeLower) chars += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUpper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) chars += '0123456789';
    if (includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    if (!chars) { toast({ title: "Error", description: "Select at least one character type", variant: "destructive" }); return; }
    
    const array = new Uint32Array(length[0]);
    crypto.getRandomValues(array);
    setPassword(Array.from(array, v => chars[v % chars.length]).join(''));
  };

  const strength = () => {
    if (length[0] >= 20 && includeUpper && includeLower && includeNumbers && includeSymbols) return { label: 'Very Strong', color: 'text-green-500' };
    if (length[0] >= 12 && [includeUpper, includeLower, includeNumbers, includeSymbols].filter(Boolean).length >= 3) return { label: 'Strong', color: 'text-emerald-500' };
    if (length[0] >= 8) return { label: 'Medium', color: 'text-yellow-500' };
    return { label: 'Weak', color: 'text-red-500' };
  };

  const s = strength();

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Length: {length[0]}</Label>
        <Slider value={length} onValueChange={setLength} min={4} max={64} step={1} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Uppercase (A-Z)', checked: includeUpper, set: setIncludeUpper },
          { label: 'Lowercase (a-z)', checked: includeLower, set: setIncludeLower },
          { label: 'Numbers (0-9)', checked: includeNumbers, set: setIncludeNumbers },
          { label: 'Symbols (!@#$)', checked: includeSymbols, set: setIncludeSymbols },
        ].map(opt => (
          <label key={opt.label} className="flex items-center gap-2 p-2 bg-muted rounded-lg cursor-pointer text-sm">
            <input type="checkbox" checked={opt.checked} onChange={e => opt.set(e.target.checked)} className="rounded" />
            {opt.label}
          </label>
        ))}
      </div>
      <p className={`text-sm font-medium ${s.color}`}>Strength: {s.label}</p>
      <Button onClick={generate} className="w-full">Generate Password</Button>
      {password && (
        <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
          <span className="font-mono text-sm flex-1 break-all">{password}</span>
          <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(password); toast({ title: "Copied!" }); }}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export const HashGenerator = () => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const generate = async () => {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const results: Record<string, string> = {};
    for (const algo of ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']) {
      const hashBuffer = await crypto.subtle.digest(algo, data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      results[algo] = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    setHashes(results);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Input Text</Label>
        <Textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Enter text to hash..." rows={3} />
      </div>
      <Button onClick={generate} disabled={!input} className="w-full">Generate Hashes</Button>
      {Object.keys(hashes).length > 0 && (
        <div className="space-y-2">
          {Object.entries(hashes).map(([algo, hash]) => (
            <div key={algo} className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-1">{algo}</p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs break-all flex-1">{hash}</span>
                <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(hash); toast({ title: `${algo} copied!` }); }}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const UUIDGenerator = () => {
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState('5');
  const { toast } = useToast();

  const generate = () => {
    const n = Math.min(Math.max(parseInt(count) || 1, 1), 100);
    setUuids(Array.from({ length: n }, () => crypto.randomUUID()));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Number of UUIDs</Label>
        <Input type="number" min="1" max="100" value={count} onChange={e => setCount(e.target.value)} />
      </div>
      <Button onClick={generate} className="w-full">Generate UUIDs</Button>
      {uuids.length > 0 && (
        <div className="space-y-1">
          {uuids.map((uuid, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <span className="font-mono text-sm flex-1">{uuid}</span>
              <Button variant="ghost" size="sm" onClick={() => { navigator.clipboard.writeText(uuid); toast({ title: "Copied!" }); }}>
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          ))}
          <Button variant="outline" onClick={() => { navigator.clipboard.writeText(uuids.join('\n')); toast({ title: "All copied!" }); }} className="w-full mt-2">
            <Copy className="mr-2 h-4 w-4" /> Copy All
          </Button>
        </div>
      )}
    </div>
  );
};

export const JWTDecoder = () => {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<{ header: any; payload: any } | null>(null);
  const [error, setError] = useState('');

  const decode = () => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format (expected 3 parts)');
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      setDecoded({ header, payload });
      setError('');
    } catch (e: any) {
      setError(e.message);
      setDecoded(null);
    }
  };

  const isExpired = decoded?.payload?.exp ? decoded.payload.exp * 1000 < Date.now() : null;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>JWT Token</Label>
        <Textarea value={token} onChange={e => setToken(e.target.value)} placeholder="eyJhbGciOiJIUzI1NiIs..." rows={3} className="font-mono text-sm" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button onClick={decode} disabled={!token.trim()} className="w-full">Decode JWT</Button>
      {decoded && (
        <div className="space-y-3">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Header</p>
            <pre className="font-mono text-sm whitespace-pre-wrap">{JSON.stringify(decoded.header, null, 2)}</pre>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs font-semibold text-muted-foreground mb-1">Payload</p>
            <pre className="font-mono text-sm whitespace-pre-wrap">{JSON.stringify(decoded.payload, null, 2)}</pre>
          </div>
          {isExpired !== null && (
            <p className={`text-sm font-medium ${isExpired ? 'text-red-500' : 'text-green-500'}`}>
              {isExpired ? '⚠ Token is expired' : '✓ Token is still valid'}
              {decoded.payload.exp && ` (expires: ${new Date(decoded.payload.exp * 1000).toLocaleString()})`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
