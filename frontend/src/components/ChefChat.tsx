import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from 'react';
import { chefChat } from '../services/api';

interface RecipeSummary {
  name: string;
  [key: string]: unknown;
}

interface ChefChatProps {
  recipe: RecipeSummary;
  accentGrad: string;
}

type ChatMessage = {
  role: 'assistant' | 'user';
  content: string;
};

const SUGGESTIONS = [
  'Can I substitute any ingredients?',
  'How do I store leftovers?',
  'How can I make it spicier?',
  'Is it freezer-friendly?',
];

export default function ChefChat({ recipe, accentGrad }: ChefChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Hi! I'm your personal chef for **${recipe.name}**. Ask me anything — substitutions, techniques, storage tips, scaling, or nutrition!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || loading) return;
    setInput('');

    const updated: ChatMessage[] = [...messages, { role: 'user', content: userText }];
    setMessages(updated);
    setLoading(true);

    try {
      const { reply } = await chefChat(recipe, updated);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: "Sorry, I couldn't reach the kitchen. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chef-chat">
      <div className="chef-chat-header" style={{ background: accentGrad }}>
        <span className="chef-chat-title">👨‍🍳 Chat with Chef</span>
      </div>

      <div className="chef-chat-messages">
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble chat-bubble--${m.role}`}>
            {m.role === 'assistant' && <span className="chat-avatar">🧑‍🍳</span>}
            <p className="chat-text">{m.content}</p>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble chat-bubble--assistant">
            <span className="chat-avatar">🧑‍🍳</span>
            <p className="chat-text chat-typing">
              <span /><span /><span />
            </p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chef-chat-suggestions">
        {SUGGESTIONS.map(s => (
          <button key={s} className="chat-suggestion" onClick={() => send(s)} disabled={loading}>
            {s}
          </button>
        ))}
      </div>

      <div className="chef-chat-input-row">
        <input
          className="chef-chat-input"
          type="text"
          placeholder="Ask the chef anything…"
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && send()}
          disabled={loading}
        />
        <button
          className="chef-chat-send"
          style={{ background: accentGrad }}
          onClick={() => send()}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}