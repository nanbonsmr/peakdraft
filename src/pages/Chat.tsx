import { useState, useEffect, useRef } from "react";
import { useChatStream, type ChatMessage } from "@/hooks/useChatStream";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
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
  Lock,
  PanelLeftClose,
  PanelLeft,
  Zap,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { InfobaseToggle, useInfobaseContext } from "@/components/InfobaseToggle";

const QUICK_PROMPTS = [
  { icon: PenLine, label: "Write a blog post", desc: "Create engaging long-form content", prompt: "Write a compelling blog post about " },
  { icon: Mail, label: "Draft an email", desc: "Professional & persuasive emails", prompt: "Draft a professional email about " },
  { icon: FileText, label: "Create ad copy", desc: "High-converting advertisements", prompt: "Create engaging ad copy for " },
  { icon: Lightbulb, label: "Brainstorm ideas", desc: "Generate creative concepts", prompt: "Give me 10 creative content ideas for " },
];

export default function Chat() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isPaid = profile?.subscription_plan && profile.subscription_plan !== "free";

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
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { infobaseEnabled, setInfobaseEnabled, selectedEntry, setSelectedEntry, getBrandContextString } = useInfobaseContext();

  useEffect(() => {
    if (isPaid) loadConversations();
  }, [loadConversations, isPaid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Close sidebar on mobile when selecting a conversation
  const handleSelectConversation = (id: string) => {
    loadMessages(id);
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    setInput("");
    sendMessage(trimmed, getBrandContextString() || undefined);
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

  if (!isPaid) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md space-y-6"
        >
          <div className="relative mx-auto w-fit">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 blur-2xl scale-150" />
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 mx-auto">
              <Lock className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-bold">AI Chat is a Pro Feature</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Upgrade to a paid plan to unlock unlimited AI chat conversations, writing assistance, and more.
            </p>
          </div>
          <Button
            onClick={() => navigate("/app/pricing")}
            className="bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 shadow-lg shadow-violet-500/20 px-6 sm:px-8"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Upgrade Now
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] sm:h-[calc(100vh-8rem)] gap-0 -m-4 sm:-m-6 rounded-xl overflow-hidden border border-border/30 bg-background/50 backdrop-blur-sm relative">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Conversation Sidebar */}
      <AnimatePresence mode="wait">
        {showSidebar && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={cn(
              "border-r border-border/30 flex flex-col bg-muted/20 shrink-0 overflow-hidden",
              "fixed inset-y-0 left-0 z-40 md:relative md:z-auto",
              "w-[280px] md:w-auto"
            )}
          >
            <div className="p-3 border-b border-border/30 flex items-center gap-2">
              <Button
                onClick={startNewChat}
                className="flex-1 gap-2 bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90 shadow-md shadow-primary/10 transition-all duration-300"
                size="sm"
              >
                <Plus className="h-4 w-4" /> New Chat
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                onClick={() => setShowSidebar(false)}
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-0.5">
                <AnimatePresence>
                  {conversations.map((conv, i) => (
                    <motion.div
                      key={conv.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.03 }}
                      className={cn(
                        "group flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-all duration-200",
                        activeConversationId === conv.id
                          ? "bg-primary/10 text-foreground border border-primary/20 shadow-sm shadow-primary/5"
                          : "hover:bg-muted/60 text-muted-foreground border border-transparent"
                      )}
                      onClick={() => handleSelectConversation(conv.id)}
                    >
                      <MessageSquare className={cn(
                        "h-4 w-4 shrink-0 transition-colors",
                        activeConversationId === conv.id ? "text-primary" : ""
                      )} />
                      <span className="truncate flex-1 font-medium">{conv.title}</span>
                      <button
                        className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-all duration-200 p-0.5 rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {conversations.length === 0 && (
                  <div className="flex flex-col items-center py-12 gap-3 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 opacity-30" />
                    <p className="text-xs">No conversations yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 border-b border-border/30 bg-background/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-muted/60"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              {showSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
            </Button>
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/30 to-indigo-500/30 blur-md scale-125" />
                <div className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-violet-500/25 ring-1 ring-white/10">
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background" />
              </div>
              <div>
                <h2 className="font-bold text-sm sm:text-base flex items-center gap-2">
                  PeakDraft AI
                  <span className="hidden xs:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-violet-500/15 to-indigo-500/15 text-violet-500 dark:text-violet-400 border border-violet-500/20">
                    <Zap className="h-2.5 w-2.5" /> Pro
                  </span>
                </h2>
                <p className="text-[10px] text-muted-foreground/60 hidden sm:block font-medium">Your AI writing companion • Always ready</p>
              </div>
            </div>
          </div>
          {isStreaming && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20"
            >
              <div className="flex gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:300ms]" />
              </div>
              <span className="text-[9px] sm:text-[10px] text-primary font-medium">Generating</span>
            </motion.div>
          )}
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1">
          <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
            {messages.length === 0 && !isLoading ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center min-h-[45vh] sm:min-h-[55vh] gap-6 sm:gap-8"
              >
                {/* Animated Hero Icon */}
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                  className="relative"
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 blur-2xl scale-150" />
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                    <Sparkles className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                  </div>
                </motion.div>

                <div className="text-center space-y-2 sm:space-y-3">
                  <h3 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    How can I help you write?
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed px-4">
                    Your AI-powered writing companion. Create blog posts, emails, ad copy, and more.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-lg px-2">
                  {QUICK_PROMPTS.map((qp, i) => (
                    <motion.button
                      key={qp.label}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + i * 0.1 }}
                      className="group flex items-start gap-2.5 sm:gap-3 p-3 sm:p-4 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 text-left hover:shadow-lg hover:shadow-primary/5"
                      onClick={() => {
                        setInput(qp.prompt);
                        textareaRef.current?.focus();
                      }}
                    >
                      <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-gradient-to-br from-violet-500/10 to-indigo-500/10 flex items-center justify-center shrink-0 group-hover:from-violet-500/20 group-hover:to-indigo-500/20 transition-colors">
                        <qp.icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-violet-400" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-medium text-foreground block">{qp.label}</span>
                        <span className="text-[10px] sm:text-[11px] text-muted-foreground">{qp.desc}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="space-y-1">
                <AnimatePresence>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <MessageBubble message={msg} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 sm:gap-4 py-5"
                  >
                    <div className="relative h-8 w-8 sm:h-10 sm:w-10 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-xl shadow-violet-500/30 ring-2 ring-violet-400/20">
                      <Sparkles className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-white animate-pulse" />
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-amber-400 border-2 border-background animate-pulse" />
                    </div>
                    <div className="flex items-center gap-3 py-3 px-4 rounded-2xl bg-muted/30 border border-border/40 backdrop-blur-sm">
                      <div className="flex gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-violet-500 animate-bounce [animation-delay:0ms]" />
                        <span className="h-2 w-2 rounded-full bg-purple-500 animate-bounce [animation-delay:150ms]" />
                        <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:300ms]" />
                      </div>
                      <span className="text-xs sm:text-sm text-muted-foreground font-medium">Thinking...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border/30 bg-gradient-to-t from-background via-background to-background/80 backdrop-blur-md p-3 sm:p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-muted/15 dark:bg-muted/10 rounded-2xl border border-border/40 focus-within:border-violet-500/40 focus-within:shadow-xl focus-within:shadow-violet-500/5 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-300 p-2.5 sm:p-3">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={handleKeyDown}
                placeholder="Write something amazing..."
                className="min-h-[44px] sm:min-h-[48px] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-2 text-sm placeholder:text-muted-foreground/50"
                rows={1}
              />
              {isStreaming ? (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-xl text-destructive hover:bg-destructive/10 transition-all duration-200"
                  onClick={stopStreaming}
                >
                  <StopCircle className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  className="h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 hover:from-violet-600 hover:via-purple-600 hover:to-indigo-700 shadow-lg shadow-violet-500/25 transition-all duration-300 disabled:opacity-20 disabled:shadow-none hover:shadow-xl hover:shadow-violet-500/30 hover:scale-105 active:scale-95"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                >
                  <Send className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-white" />
                </Button>
              )}
            </div>
            <div className="flex items-center justify-between gap-2 mt-2.5">
              <InfobaseToggle
                enabled={infobaseEnabled}
                onToggle={setInfobaseEnabled}
                selectedEntry={selectedEntry}
                onSelectEntry={setSelectedEntry}
              />
              <span className="text-[10px] text-muted-foreground/50 shrink-0 hidden sm:inline font-medium">
                ↵ Send • ⇧↵ New line
              </span>
            </div>
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
    <div className={cn("group flex items-start gap-3 sm:gap-4 py-4 sm:py-5", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cn(
          "relative h-8 w-8 sm:h-10 sm:w-10 rounded-2xl flex items-center justify-center shrink-0",
          isUser
            ? "bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-500 dark:to-slate-700 shadow-lg shadow-slate-500/15 ring-2 ring-slate-400/10"
            : "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 shadow-xl shadow-violet-500/30 ring-2 ring-violet-400/20"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-white" />
        ) : (
          <Sparkles className="h-4 w-4 sm:h-[18px] sm:w-[18px] text-white" />
        )}
        {!isUser && (
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 border-2 border-background shadow-sm" />
        )}
      </motion.div>

      {/* Content */}
      <div className={cn("max-w-[88%] sm:max-w-[82%] space-y-1", isUser && "flex flex-col items-end")}>
        <span className={cn(
          "text-[10px] sm:text-[11px] font-semibold mb-0.5 block tracking-wide",
          isUser ? "text-muted-foreground/60 text-right" : "text-violet-500 dark:text-violet-400"
        )}>
          {isUser ? "You" : "PeakDraft AI"}
        </span>
        <div
          className={cn(
            "rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5 text-[13px] sm:text-sm leading-relaxed",
            isUser
              ? "bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 text-white rounded-tr-sm shadow-lg shadow-violet-500/20 ring-1 ring-white/10"
              : "bg-muted/40 dark:bg-muted/20 border border-border/50 rounded-tl-sm backdrop-blur-sm"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-headings:my-3 prose-headings:font-bold prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-pre:my-2.5 prose-pre:rounded-xl prose-pre:bg-background/80 prose-pre:border prose-pre:border-border/30 prose-code:text-violet-500 prose-code:dark:text-violet-400 prose-code:bg-violet-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-xs prose-code:font-medium prose-a:text-violet-500 prose-a:dark:text-violet-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-foreground prose-blockquote:border-l-violet-400 prose-blockquote:bg-violet-500/5 prose-blockquote:rounded-r-lg prose-blockquote:py-1 prose-blockquote:px-4">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isUser && message.content && (
          <div className="flex items-center gap-1 mt-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "h-7 px-2.5 text-[10px] sm:text-[11px] gap-1.5 rounded-lg font-medium transition-all duration-200",
                copied ? "text-emerald-500 bg-emerald-500/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
              onClick={handleCopy}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2.5 text-[10px] sm:text-[11px] gap-1.5 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-200"
              onClick={handleExportTxt}
            >
              <Download className="h-3 w-3" />
              Export
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
