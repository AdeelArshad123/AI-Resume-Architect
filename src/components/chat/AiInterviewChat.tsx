"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { ChatMessageView } from "@/components/chat/ChatMessage";
import { useResumeStore } from "@/store/resumeStore";

const INITIAL_QUESTION =
  "Tell me about your most challenging project. What was the situation, and why was it difficult?";

type InterviewApiResponse = {
  roleTitle: string;
  assistantMessage: string;
  bullets: string[];
  star?: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  nextQuestion?: string;
};

export function AiInterviewChat() {
  const messages = useResumeStore((s) => s.messages);
  const addMessage = useResumeStore((s) => s.addMessage);
  const applyInterviewResult = useResumeStore((s) => s.applyInterviewResult);
  const resume = useResumeStore((s) => s.resume);

  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Ensure we always show the first AI question.
  useEffect(() => {
    if (messages.length === 0) {
      addMessage({ role: "assistant", content: INITIAL_QUESTION });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lastUserMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "user") return messages[i];
    }
    return null;
  }, [messages]);

  async function onSend() {
    const answer = draft.trim();
    if (!answer) return;
    if (isLoading) return;

    setIsLoading(true);
    try {
      addMessage({ role: "user", content: answer });
      setDraft("");

      const conversationWithNew = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user" as const, content: answer }
      ];

      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer,
          conversation: conversationWithNew,
          // Provide some context for better STAR framing.
          lastUserAnswer: answer,
          resume
        })
      });

      if (!res.ok) throw new Error(`AI request failed: ${res.status}`);

      const data = (await res.json()) as InterviewApiResponse;

      addMessage({ role: "assistant", content: data.nextQuestion ?? data.assistantMessage });
      applyInterviewResult({
        roleTitle: data.roleTitle,
        bullets: data.bullets,
        star: data.star
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-semibold tracking-wide text-electric/90">AI Interview</div>
        {lastUserMessage ? (
          <div className="text-xs text-white/60">STAR rewrite in progress</div>
        ) : (
          <div className="text-xs text-white/60">Answer to begin</div>
        )}
      </div>

      <div className="mt-3 space-y-3 overflow-auto pr-1" style={{ maxHeight: 520 }}>
        {messages.map((m) => (
          <ChatMessageView key={m.id} message={m} />
        ))}
      </div>

      <div className="mt-4">
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type or paste your answer..."
          className="min-h-[92px] resize-none"
          disabled={isLoading}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="text-xs text-white/60">
            Tip: include metrics, scope, tools, and your specific actions.
          </div>
          <Button onClick={onSend} disabled={isLoading || !draft.trim()}>
            {isLoading ? "Generating..." : "Send"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

