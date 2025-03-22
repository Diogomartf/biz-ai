// components/chat.tsx
"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      // For now, context is empty; we'll add it via API in Phase 3
    });

  const scrollRef = useRef<HTMLDivElement>(null);

  const useDebouncedScroll = (delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const scrollToBottom = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const viewport = scrollRef.current?.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (viewport) {
          viewport.scrollTo({
            top: viewport.scrollHeight,
            behavior: "smooth",
          });
        }
      }, delay);
    };

    useEffect(() => {
      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, []);

    return scrollToBottom;
  };

  const scrollToBottom = useDebouncedScroll(100);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-foreground">BizAI Chat</h1>
        <Link href="/dashboard" className="cursor-pointer">
          <Button className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
            Go to Dashboard
          </Button>
        </Link>
      </div>
      <ScrollArea
        ref={scrollRef}
        className="flex-1 mb-6 p-4 border rounded-2xl bg-background scroll-smooth"
      >
        <div className="space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              } animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div
                className={`max-w-xs p-3 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 rounded-xl bg-background text-foreground border-input"
        />
        <Button
          type="submit"
          disabled={isLoading}
          className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <span className="animate-spin inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
              Sending
            </>
          ) : (
            "Send"
          )}
        </Button>
      </form>
    </div>
  );
}
