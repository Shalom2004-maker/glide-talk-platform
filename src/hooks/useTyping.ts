import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

const TYPING_TIMEOUT_MS = 3000;
const TYPING_DEBOUNCE_MS = 500;

interface TypingEvent {
  user_id: string;
  display_name: string | null;
  conversation_id: string;
}

export function useTypingIndicator(conversationId: string | null) {
  const { user } = useAuth();
  const [otherTyping, setOtherTyping] = useState<TypingEvent | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const typingSentTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase.channel(`typing:${conversationId}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        const data = payload.payload as TypingEvent;
        if (data.user_id === user.id) return;
        if (data.conversation_id !== conversationId) return;

        setOtherTyping(data);

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setOtherTyping(null);
        }, TYPING_TIMEOUT_MS);
      })
      .on("broadcast", { event: "stop_typing" }, (payload) => {
        const data = payload.payload as TypingEvent;
        if (data.user_id === user.id) return;
        if (data.conversation_id !== conversationId) return;

        setOtherTyping(null);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      })
      .subscribe();

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (typingSentTimeoutRef.current) clearTimeout(typingSentTimeoutRef.current);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setOtherTyping(null);
    };
  }, [conversationId, user]);

  const broadcastTyping = useCallback(
    (displayName: string | null) => {
      if (!conversationId || !user || !channelRef.current) return;

      const now = Date.now();
      if (now - lastTypingSentRef.current < TYPING_DEBOUNCE_MS) return;
      lastTypingSentRef.current = now;

      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: {
          user_id: user.id,
          display_name: displayName,
          conversation_id: conversationId,
        },
      });

      if (typingSentTimeoutRef.current) clearTimeout(typingSentTimeoutRef.current);
      typingSentTimeoutRef.current = setTimeout(() => {
        if (channelRef.current) {
          channelRef.current.send({
            type: "broadcast",
            event: "stop_typing",
            payload: {
              user_id: user.id,
              display_name: displayName,
              conversation_id: conversationId,
            },
          });
        }
      }, TYPING_TIMEOUT_MS);
    },
    [conversationId, user]
  );

  const broadcastStopTyping = useCallback(
    (displayName: string | null) => {
      if (!conversationId || !user || !channelRef.current) return;

      if (typingSentTimeoutRef.current) clearTimeout(typingSentTimeoutRef.current);

      channelRef.current.send({
        type: "broadcast",
        event: "stop_typing",
        payload: {
          user_id: user.id,
          display_name: displayName,
          conversation_id: conversationId,
        },
      });
    },
    [conversationId, user]
  );

  return { otherTyping, broadcastTyping, broadcastStopTyping };
}
