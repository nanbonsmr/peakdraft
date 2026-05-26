import { Button } from "@/components/ui/button";
import { Copy, Download, FileText, BookmarkPlus, Edit3 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ActionResult } from "./types";
import { ALL_ACTIONS } from "./actions";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PostToLinkedInButton } from "@/components/linkedin/PostToLinkedInButton";

interface Props {
  result: ActionResult;
  context: { content: string; title?: string };
  onSendToEditor: () => void;
}

export function ResultCard({ result, context, onSendToEditor }: Props) {
  const meta = ALL_ACTIONS[result.action];
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCopy = () => {
    navigator.clipboard.writeText(result.result);
    toast({ title: "Copied!" });
  };

  const handleSaveToInfobase = async () => {
    if (!user) return;
    try {
      // Append to active infobase entry's additional_context
      const { data: entries } = await supabase
        .from("infobase")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1);

      const stamp = `\n\n[${meta.label} – ${new Date().toLocaleDateString()}]\n${result.result}`;

      if (entries && entries.length > 0) {
        const existing = entries[0];
        await supabase
          .from("infobase")
          .update({
            additional_context: ((existing as any).additional_context || "") + stamp,
            updated_at: new Date().toISOString(),
          })
          .eq("id", (existing as any).id);
        toast({ title: "Saved to Infobase", description: `Added to "${(existing as any).brand_name}"` });
      } else {
        toast({
          title: "No Infobase yet",
          description: "Create a brand profile first.",
          variant: "destructive",
        });
        navigate("/app/infobase");
      }
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([result.result], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.action}-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-xl border border-border/50 bg-muted/20 overflow-hidden">
      <div className="px-3 py-2 border-b border-border/40 bg-background/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold">{meta.label}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {new Date(result.ranAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
      <div className="p-3 max-h-96 overflow-auto space-y-2">
        {(() => {
          const imgRegex = /!\[([^\]]*)\]\((https?:[^)]+)\)/g;
          const matches = [...result.result.matchAll(imgRegex)];
          if (matches.length > 0) {
            return (
              <div className="grid grid-cols-2 gap-2">
                {matches.map((m, i) => (
                  <a key={i} href={m[2]} target="_blank" rel="noopener noreferrer" className="block group">
                    <img src={m[2]} alt={m[1] || "Generated"} className="w-full rounded-lg border border-border/40 group-hover:border-primary/60 transition" />
                    <p className="text-[10px] text-muted-foreground mt-1 text-center">{m[1]}</p>
                  </a>
                ))}
              </div>
            );
          }
          return <pre className="whitespace-pre-wrap text-xs font-sans leading-relaxed">{result.result}</pre>;
        })()}
      </div>
      <div className="px-3 py-2 border-t border-border/40 bg-background/50 flex flex-wrap gap-1.5">
        <Button size="sm" variant="ghost" className="h-6 text-[11px] gap-1 px-2" onClick={handleCopy}>
          <Copy className="h-3 w-3" /> Copy
        </Button>
        <Button size="sm" variant="ghost" className="h-6 text-[11px] gap-1 px-2" onClick={onSendToEditor}>
          <Edit3 className="h-3 w-3" /> Editor
        </Button>
        <Button size="sm" variant="ghost" className="h-6 text-[11px] gap-1 px-2" onClick={handleSaveToInfobase}>
          <BookmarkPlus className="h-3 w-3" /> Infobase
        </Button>
        <Button size="sm" variant="ghost" className="h-6 text-[11px] gap-1 px-2" onClick={handleDownload}>
          <Download className="h-3 w-3" /> .md
        </Button>
        <PostToLinkedInButton
          content={result.result}
          imageUrl={(result.result.match(/!\[[^\]]*\]\((https?:[^)]+)\)/)?.[1]) || null}
          source={`workflow:${result.action}`}
          size="sm"
          variant="ghost"
          className="h-6 text-[11px] gap-1 px-2"
        />
      </div>
    </div>
  );
}
