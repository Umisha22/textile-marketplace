import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';

/**
 * Reusable AI assistant state: message list, loading, suggestions and send().
 * Restores persisted history for logged-in users.
 */
export function useAiChat({ mode = 'assistant', restore = true } = {}) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (!restore) return;
    let active = true;
    api
      .get(`/ai/conversation?mode=${mode}`)
      .then((data) => {
        if (active) setMessages(data.messages || []);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [mode, restore]);

  const send = useCallback(
    async (text) => {
      const t = String(text).trim();
      if (!t) return null;
      setMessages((m) => [...m, { from: 'user', text: t }]);
      setLoading(true);
      setSuggestions([]);
      try {
        const data = await api.post('/ai/chat', { message: t, mode });
        setMessages((m) => [
          ...m,
          {
            from: 'assistant',
            text: data.reply,
            products: data.products,
            compare: data.compare,
          },
        ]);
        setSuggestions(data.suggestions || []);
        return data;
      } catch (err) {
        setMessages((m) => [
          ...m,
          { from: 'assistant', text: `I ran into a problem: ${err.message}` },
        ]);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mode]
  );

  return { messages, setMessages, loading, suggestions, send };
}
