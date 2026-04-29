"use client";

import type { ChatMessage as ChatMessageType } from "@/types/resume";

export function ChatMessageView({ message }: { message: ChatMessageType }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}>
      <div
        className={[
          "max-w-[85%] rounded-2xl border border-white/10 px-4 py-3 text-sm leading-relaxed",
          isUser ? "bg-electric/15 text-white" : "bg-white/5 text-white/90"
        ].join(" ")}
      >
        {message.content}
      </div>
    </div>
  );
}

