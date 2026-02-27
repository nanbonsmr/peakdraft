import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export function useChatStream() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setConversations(data);
  }, [user]);

  const loadMessages = useCallback(async (conversationId: string) => {
    const { data } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (data) setMessages(data as ChatMessage[]);
    setActiveConversationId(conversationId);
  }, []);

  const createConversation = useCallback(async (title = "New Chat") => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ user_id: user.id, title })
      .select()
      .single();
    if (error || !data) return null;
    setConversations((prev) => [data, ...prev]);
    setActiveConversationId(data.id);
    setMessages([]);
    return data.id;
  }, [user]);

  const deleteConversation = useCallback(async (id: string) => {
    await supabase.from("chat_conversations").delete().eq("id", id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
      setMessages([]);
    }
  }, [activeConversationId]);

  const sendMessage = useCallback(async (content: string, brandContext?: string) => {
    if (!user || isStreaming) return;

    let convId = activeConversationId;
    if (!convId) {
      convId = await createConversation(content.slice(0, 50));
      if (!convId) return;
    }

    // Save user message
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    await supabase.from("chat_messages").insert({
      conversation_id: convId,
      role: "user",
      content,
    });

    // Auto-title on first message
    if (messages.length === 0) {
      const title = content.slice(0, 60);
      await supabase.from("chat_conversations").update({ title }).eq("id", convId);
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, title } : c))
      );
    }

    // Stream AI response
    setIsStreaming(true);
    setIsLoading(true);
    const controller = new AbortController();
    abortRef.current = controller;

    const allMessages = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    let assistantContent = "";
    const assistantId = crypto.randomUUID();

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: allMessages, brand_context: brandContext || undefined }),
        signal: controller.signal,
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to get response");
      }

      setIsLoading(false);
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      // Add empty assistant message
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", created_at: new Date().toISOString() },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIdx: number;
        while ((newlineIdx = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIdx);
          buffer = buffer.slice(newlineIdx + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              const finalContent = assistantContent;
              setMessages((prev) =>
                prev.map((m) => (m.id === assistantId ? { ...m, content: finalContent } : m))
              );
            }
          } catch {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      // Save assistant message to DB and count words
      if (assistantContent) {
        const wordCount = assistantContent.trim().split(/\s+/).filter(Boolean).length;
        
        await Promise.all([
          supabase.from("chat_messages").insert({
            conversation_id: convId,
            role: "assistant",
            content: assistantContent,
          }),
          supabase
            .from("chat_conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", convId),
          // Update word usage
          supabase.rpc("update_word_usage", {
            user_uuid: user.id,
            words_to_add: wordCount,
          }),
        ]);
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error("Chat error:", e);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: `⚠️ ${e.message || "Something went wrong. Please try again."}` }
              : m
          )
        );
      }
    } finally {
      setIsStreaming(false);
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [user, activeConversationId, messages, isStreaming, createConversation]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const startNewChat = useCallback(() => {
    setActiveConversationId(null);
    setMessages([]);
  }, []);

  return {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    isStreaming,
    loadConversations,
    loadMessages,
    createConversation,
    deleteConversation,
    sendMessage,
    stopStreaming,
    startNewChat,
  };
}
