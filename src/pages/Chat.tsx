import { useState, useEffect, useRef } from "react";
import { useChatStream, type ChatMessage, type Conversation } from "@/hooks/useChatStream";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send,
  Plus,
  Trash2,
  MessageSquare,
  StopCircle,
  Bot,
  User,
  Sparkles,
  PenLine,
  Mail,
  FileText,
  Lightbulb,
  Loader2,
  Copy,
  Check,
  Download,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const QUICK_PROMPTS = [
  { icon: PenLine, label: "Write a blog post", prompt: "Write a compelling blog post about " },
  { icon: Mail, label: "Draft an email", prompt: "Draft a professional email about " },
  { icon: FileText, label: "Create ad copy", prompt: "Create engaging ad copy for " },
  { icon: Lightbulb, label: "Brainstorm ideas", prompt: "Give me 10 creative content ideas for " },
];

export default function Chat() {
  const {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    isStreaming,
    loadConversations,
    loadMessages,
    sendMessage,
    deleteConversation,
    stopStreaming,
    startNewChat,
  } = useChatStream();

  const [input, setInput] = useState("");
  const [showSidebar, setShowSidebar] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    sendMessage(trimmed);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 -m-4 sm:-m-6">
      {/* Conversation Sidebar */}
      <div
        className={cn(
          "border-r border-border/50 flex flex-col bg-muted/30 transition-all duration-300 shrink-0",
          showSidebar ? "w-64" : "w-0 overflow-hidden"
        )}
      >
        <div className="p-3 border-b border-border/50">
          <Button onClick={startNewChat} className="w-full gap-2" size="sm">
            <Plus className="h-4 w-4" /> New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors",
                  activeConversationId === conv.id
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-muted text-muted-foreground"
                )}
                onClick={() => loadMessages(conv.id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate flex-1">{conv.title}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">
                No conversations yet
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Bot className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">PeakDraft AI</h2>
              <p className="text-[10px] text-muted-foreground">Writing Assistant</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-6">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold">How can I help you write?</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    I can help with blog posts, emails, ad copy, social media content, and more.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full max-w-lg">
                  {QUICK_PROMPTS.map((qp) => (
                    <button
                      key={qp.label}
                      className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/50 hover:border-primary/30 transition-all text-left text-sm"
                      onClick={() => {
                        setInput(qp.prompt);
                        textareaRef.current?.focus();
                      }}
                    >
                      <qp.icon className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-muted-foreground">{qp.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <div className="flex items-center gap-2 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="border-t border-border/50 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-muted/30 rounded-xl border border-border/50 focus-within:border-primary/50 transition-colors p-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-2 text-sm"
                rows={1}
              />
              {isStreaming ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9 shrink-0 text-destructive"
                  onClick={stopStreaming}
                >
                  <StopCircle className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              PeakDraft AI can make mistakes. Review important content carefully.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTxt = () => {
    const blob = new Blob([message.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "peakdraft-response.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={cn("group flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
          isUser
            ? "bg-secondary"
            : "bg-gradient-to-br from-primary to-primary/60"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-secondary-foreground" />
        ) : (
          <Bot className="h-4 w-4 text-primary-foreground" />
        )}
      </div>
      <div className="max-w-[85%]">
        <div
          className={cn(
            "rounded-xl px-4 py-3 text-sm",
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 border border-border/50"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-pre:my-2">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        {!isUser && message.content && (
          <div className="flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5 text-muted-foreground" onClick={handleCopy}>
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1.5 text-muted-foreground" onClick={handleExportTxt}>
              <Download className="h-3 w-3" />
              Export .txt
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
