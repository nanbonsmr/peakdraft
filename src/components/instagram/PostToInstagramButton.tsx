import { useState } from "react";
import { Instagram, Loader2, Calendar, Send, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useInstagram, postToInstagram } from "@/hooks/useInstagram";
import { useNavigate } from "react-router-dom";

interface Props {
  content: string;
  imageUrl?: string | null;
  source?: string;
  size?: "sm" | "default";
  variant?: "ghost" | "outline" | "default";
  className?: string;
  label?: string;
}

function plainText(input: string) {
  return input
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/[*_`#>]+/g, "")
    .trim();
}

const IG_GRADIENT = "bg-gradient-to-br from-[#f9ce34] via-[#ee2a7b] to-[#6228d7]";

export function PostToInstagramButton({
  content, imageUrl, source, size = "sm", variant = "ghost", className, label = "Instagram",
}: Props) {
  const { isConnected, connection } = useInstagram();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [caption, setCaption] = useState("");
  const [when, setWhen] = useState("");
  const [posting, setPosting] = useState(false);
  const [tab, setTab] = useState("now");

  const hasImage = !!imageUrl;

  const handleOpen = () => {
    setCaption(plainText(content).slice(0, 2200));
    setOpen(true);
  };

  const submit = async (schedule: boolean) => {
    if (!caption.trim()) {
      toast({ title: "Empty caption", variant: "destructive" });
      return;
    }
    if (!hasImage) {
      toast({
        title: "Image required",
        description: "Instagram requires an image. Use the manual share option below.",
        variant: "destructive",
      });
      return;
    }
    if (!isConnected) {
      toast({ title: "Connect Instagram first", description: "Authorize PeakDraft to post on your behalf." });
      navigate("/app/instagram");
      return;
    }
    if (schedule && !when) {
      toast({ title: "Pick a date/time", variant: "destructive" });
      return;
    }
    setPosting(true);
    try {
      const res = await postToInstagram({
        caption,
        image_url: imageUrl!,
        schedule_for: schedule ? new Date(when).toISOString() : null,
        source,
      });
      if (res.scheduled) {
        toast({ title: "Scheduled", description: `Will post at ${new Date(when).toLocaleString()}` });
      } else {
        toast({ title: "Posted to Instagram", description: res.permalink ? "Open post" : "Live on your feed." });
      }
      setOpen(false);
      setWhen("");
    } catch (err: any) {
      toast({ title: "Post failed", description: err.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  const manualShare = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      toast({ title: "Caption copied", description: "Paste it in Instagram after sharing the image." });
    } catch (_) {}
    if (imageUrl) window.open(imageUrl, "_blank");
    window.open("https://www.instagram.com/", "_blank");
  };

  return (
    <>
      <Button size={size} variant={variant} className={className} onClick={handleOpen}>
        <Instagram className="h-3.5 w-3.5 text-[#ee2a7b]" />
        <span className="ml-1.5">{label}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Instagram className="h-5 w-5 text-[#ee2a7b]" />
              Post to Instagram
            </DialogTitle>
            <DialogDescription>
              {isConnected ? (
                <>Posting as <span className="font-medium text-foreground">@{connection?.ig_username}</span></>
              ) : (
                <span className="text-amber-500">Not connected — use manual share or connect first.</span>
              )}
            </DialogDescription>
          </DialogHeader>

          {imageUrl ? (
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <img src={imageUrl} alt="Post preview" className="w-full max-h-64 object-cover" />
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
              <strong className="text-amber-500">No image attached.</strong> Instagram API requires an image. You can still copy the caption and post manually.
            </div>
          )}

          <Textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value.slice(0, 2200))}
            rows={6}
            className="resize-none"
            placeholder="Write your caption…"
          />
          <p className="text-[11px] text-muted-foreground text-right -mt-2">{caption.length}/2200</p>

          {hasImage && isConnected ? (
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="now"><Send className="h-3.5 w-3.5 mr-1.5" />Post now</TabsTrigger>
                <TabsTrigger value="schedule"><Calendar className="h-3.5 w-3.5 mr-1.5" />Schedule</TabsTrigger>
              </TabsList>
              <TabsContent value="now" className="text-xs text-muted-foreground pt-2">
                Publishes immediately to your IG feed.
              </TabsContent>
              <TabsContent value="schedule" className="pt-2">
                <Input
                  type="datetime-local"
                  value={when}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setWhen(e.target.value)}
                />
              </TabsContent>
            </Tabs>
          ) : null}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={manualShare} className="sm:mr-auto">
              <Download className="h-4 w-4 mr-1.5" />
              Copy caption + Open IG
            </Button>
            {!isConnected && (
              <Button variant="outline" onClick={() => { setOpen(false); navigate("/app/instagram"); }}>
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Connect
              </Button>
            )}
            {hasImage && isConnected && (
              <Button
                onClick={() => submit(tab === "schedule")}
                disabled={posting}
                className={`${IG_GRADIENT} text-white border-0 hover:opacity-90`}
              >
                {posting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Instagram className="h-4 w-4 mr-1.5" />}
                {tab === "schedule" ? "Schedule" : "Post now"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
