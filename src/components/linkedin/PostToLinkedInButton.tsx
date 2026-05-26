import { useState } from "react";
import { Linkedin, Loader2, Calendar, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useLinkedIn, postToLinkedIn } from "@/hooks/useLinkedIn";
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

// Strip markdown image/link syntax for LinkedIn text body (LinkedIn doesn't render markdown).
function plainText(input: string) {
  return input
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/[*_`#>]+/g, "")
    .trim();
}

export function PostToLinkedInButton({
  content, imageUrl, source, size = "sm", variant = "ghost", className, label = "LinkedIn",
}: Props) {
  const { isConnected, connection, connect } = useLinkedIn();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [when, setWhen] = useState("");
  const [posting, setPosting] = useState(false);
  const [tab, setTab] = useState("now");

  const handleOpen = () => {
    if (!isConnected) {
      toast({
        title: "Connect LinkedIn first",
        description: "Authorize PeakDraft to post on your behalf.",
      });
      navigate("/app/linkedin");
      return;
    }
    setText(plainText(content).slice(0, 3000));
    setOpen(true);
  };

  const submit = async (schedule: boolean) => {
    if (!text.trim()) {
      toast({ title: "Empty post", variant: "destructive" });
      return;
    }
    if (schedule && !when) {
      toast({ title: "Pick a date/time", variant: "destructive" });
      return;
    }
    setPosting(true);
    try {
      const res = await postToLinkedIn({
        text,
        image_url: imageUrl || null,
        schedule_for: schedule ? new Date(when).toISOString() : null,
        source,
      });
      if (res.scheduled) {
        toast({ title: "Scheduled", description: `Will post at ${new Date(when).toLocaleString()}` });
      } else {
        toast({
          title: "Posted to LinkedIn",
          description: res.postUrl ? "Open post" : "Live on your feed.",
        });
      }
      setOpen(false);
      setWhen("");
    } catch (err: any) {
      toast({ title: "Post failed", description: err.message, variant: "destructive" });
    } finally {
      setPosting(false);
    }
  };

  return (
    <>
      <Button size={size} variant={variant} className={className} onClick={handleOpen}>
        <Linkedin className="h-3.5 w-3.5 text-[#0a66c2]" />
        <span className="ml-1.5">{label}</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Linkedin className="h-5 w-5 text-[#0a66c2]" />
              Post to LinkedIn
            </DialogTitle>
            <DialogDescription>
              Posting as <span className="font-medium text-foreground">{connection?.name || "you"}</span>
            </DialogDescription>
          </DialogHeader>

          {imageUrl && (
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <img src={imageUrl} alt="Post preview" className="w-full max-h-48 object-cover" />
            </div>
          )}

          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 3000))}
            rows={7}
            className="resize-none"
            placeholder="What do you want to share?"
          />
          <p className="text-[11px] text-muted-foreground text-right -mt-2">{text.length}/3000</p>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="now"><Send className="h-3.5 w-3.5 mr-1.5" />Post now</TabsTrigger>
              <TabsTrigger value="schedule"><Calendar className="h-3.5 w-3.5 mr-1.5" />Schedule</TabsTrigger>
            </TabsList>
            <TabsContent value="now" className="text-xs text-muted-foreground pt-2">
              Publishes immediately to your LinkedIn feed.
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={posting}>Cancel</Button>
            <Button onClick={() => submit(tab === "schedule")} disabled={posting}>
              {posting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Linkedin className="h-4 w-4 mr-1.5" />}
              {tab === "schedule" ? "Schedule" : "Post now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
