'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Send, X, Zap, ExternalLink, RefreshCw, ThumbsUp, ThumbsDown, Check, Compass, ChevronDown, MessageSquare } from 'lucide-react';

const SUGGESTED_QUESTIONS_MAP = {
  '/peta-penampilan': [
    'Event apa yang ada di Bandung?',
    'Berapa total kota dikunjungi?',
    'Penampilan offair di Surabaya',
    'Event terbesar di Jakarta',
  ],
  '/gallery': [
    'Lihat foto visual Live2D Intan',
    'Ada foto Minecraft Castle?',
    'Cari galeri concert',
    'Foto Summer Party',
  ],
  '/schedule': [
    'Jadwal show teater berikutnya',
    'Event JKT48 Trainee',
    'Status pertunjukan teater',
    'Event online vs offline',
  ],
  '/about-intan': [
    'Apa prestasi Pencak Silat Intan?',
    'Di mana Intan menempuh kuliah?',
    'Apa quote motivasi Intan?',
    'Apa makanan favorit Intan?',
  ],
  '/shining-star': [
    'Timeline pencapaian debut Intan',
    'Show teater pertama Intan',
    'Kapan Halloween event Gen 13?',
    'Prestasi milestone Intan',
  ],
  '/news': [
    'Berita terbaru edisi 1 tahun',
    'Pengumuman merchandise debut',
    'Agenda stream amal Ramadhan',
    'Kategori news terbaru',
  ],
};

const DEFAULT_QUESTIONS = [
  'Tampilkan event Surabaya',
  'Penampilan di Bandung',
  'Statistik show & event Intan',
  'Prestasi Pencak Silat Intan',
];

/**
 * Format markdown bold (**text**), italic (*text*), and bullet lists (- item) cleanly into HTML
 */
function formatMessageText(text, isUser = false) {
  if (!text) return null;

  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    if (!line.trim()) {
      return <div key={lineIdx} className="h-1.5" />;
    }

    const trimmed = line.trim();
    const isBullet = trimmed.startsWith('- ') || trimmed.startsWith('* ');
    const content = isBullet ? trimmed.replace(/^[-*]\s+/, '') : line;

    // Parse **bold** and *italic*
    const parts = [];
    let lastIndex = 0;
    const regex = /(\*\*|__)(.*?)\1|(\*|_)(.*?)\3/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      if (match[2]) {
        // Bold text
        parts.push(
          <strong
            key={match.index}
            className={isUser ? 'font-bold text-white' : 'font-bold text-slate-900'}
          >
            {match[2]}
          </strong>
        );
      } else if (match[4]) {
        // Italic text
        parts.push(
          <em key={match.index} className="italic">
            {match[4]}
          </em>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    const renderedParts = parts.length > 0 ? parts : content;

    if (isBullet) {
      return (
        <div key={lineIdx} className="flex items-start gap-1.5 my-0.5">
          <span className={isUser ? 'text-white font-bold select-none' : 'text-pink-500 font-bold select-none'}>
            •
          </span>
          <span className="flex-1">{renderedParts}</span>
        </div>
      );
    }

    return (
      <div key={lineIdx} className="my-0.5">
        {renderedParts}
      </div>
    );
  });
}

export default function IrisChatWidget() {
  const pathname = usePathname() || '/';
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: 'Hai Bub, Apa kabar? Ada yang mau ditanyakan?',
      sources: [],
      cached: false,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Math.random().toString(36).substring(2, 9)}`);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const messagesEndRef = useRef(null);

  const currentSuggestedQuestions = SUGGESTED_QUESTIONS_MAP[pathname] || DEFAULT_QUESTIONS;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setShowTooltip(false);
    } else {
      // Auto pop-up tooltip after 1.5s delay, then hide after 7.5s
      const timerShow = setTimeout(() => setShowTooltip(true), 1500);
      const timerHide = setTimeout(() => setShowTooltip(false), 7500);

      return () => {
        clearTimeout(timerShow);
        clearTimeout(timerHide);
      };
    }
  }, [messages, isOpen]);

  // Client-Side Action Executor
  const executeAction = (action) => {
    if (!action || !action.name) return;

    try {
      if (action.name === 'navigate') {
        if (action.path && action.path !== pathname) {
          router.push(action.path);
        }
      } else if (action.name === 'zoomMap') {
        const cityParam = encodeURIComponent(action.city);
        if (pathname !== '/peta-penampilan') {
          router.push(`/peta-penampilan?city=${cityParam}`);
        }
        window.dispatchEvent(new CustomEvent('iris:zoomMap', { detail: action }));
      } else if (action.name === 'applyFilter') {
        window.dispatchEvent(new CustomEvent('iris:applyFilter', { detail: action }));
      } else if (action.name === 'openGallery') {
        router.push(`/gallery?id=${encodeURIComponent(action.eventId)}`);
      } else if (action.name === 'highlightTimeline') {
        router.push(`/shining-star?id=${encodeURIComponent(action.entryId)}`);
      }
    } catch (e) {
      console.warn('Action execution error on client:', e);
    }
  };

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;

    const historyForMemory = messages
      .filter((m) => m.id !== 'welcome-1' && m.text)
      .slice(-6)
      .map((m) => ({ sender: m.sender, text: m.text }));

    setMessages((prev) => [
      ...prev,
      { id: userMessageId, sender: 'user', text: query },
      { id: assistantMessageId, sender: 'assistant', text: '', sources: [], isLoading: true, cached: false },
    ]);

    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          sessionId,
          pageContext: {
            currentPage: pathname,
          },
          recentMessages: historyForMemory,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const isCachedHeader = response.headers.get('X-Cache-Hit') === 'true';
      const latencyHeader = response.headers.get('X-Latency-Ms');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = '';
      let accumulatedSources = [];
      let isCached = isCachedHeader;
      let latencyMs = latencyHeader ? parseInt(latencyHeader, 10) : null;
      let logId = null;
      let executedAction = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);

              if (parsed.type === 'metadata') {
                if (parsed.sources) accumulatedSources = parsed.sources;
              } else if (parsed.type === 'action') {
                executedAction = parsed.action;
                executeAction(parsed.action);
              } else if (parsed.type === 'token') {
                accumulatedText += parsed.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, text: accumulatedText, isLoading: false, action: executedAction }
                      : msg
                  )
                );
              } else if (parsed.type === 'done') {
                if (parsed.sources) accumulatedSources = parsed.sources;
                if (parsed.cached) isCached = true;
                if (parsed.latency_ms) latencyMs = parsed.latency_ms;
                if (parsed.log_id) logId = parsed.log_id;
              }
            } catch (e) {
              // Ignore line parse error
            }
          }
        }
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                text: accumulatedText || 'Maaf ya Bub, belum ada tanggapan yang bisa dihasilkan.',
                sources: accumulatedSources,
                isLoading: false,
                cached: isCached,
                latencyMs,
                logId,
                action: executedAction,
              }
            : msg
        )
      );
    } catch (err) {
      console.error('Chat stream error:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                text: 'Maaf ya Bub, terjadi kendala koneksi saat menghubungi IRIS Assistant. Coba lagi sebentar lagi ya.',
                isLoading: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId, logId, score) => {
    if (!logId || feedbackGiven[messageId]) return;

    setFeedbackGiven((prev) => ({ ...prev, [messageId]: score }));

    try {
      await fetch('/api/chat/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId,
          sessionId,
          feedback: score,
        }),
      });
    } catch (e) {
      console.warn('Could not submit feedback:', e);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 font-sans">
      {/* Floating Toggle Button with Pop-up Speech Bubble */}
      {!isOpen && (
        <div className="relative flex items-center group">
          {/* Interactive Speech Bubble Tooltip (Positioned Above & Viewport Aligned) */}
          {(showTooltip || isHovered) && (
            <div className="absolute right-0 -top-14 whitespace-nowrap bg-white text-slate-800 text-xs font-semibold px-3.5 py-2 rounded-2xl shadow-xl border border-pink-200/90 flex items-center gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-300 pointer-events-none z-10">
              <span>Hai Bub, ada yang bisa aku bantu? 👋</span>
              {/* Bubble Arrow pointing DOWN to button center */}
              <div className="absolute -bottom-1.5 right-6 sm:right-7 w-3 h-3 bg-white border-b border-r border-pink-200/90 rotate-45"></div>
            </div>
          )}

          <button
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{ backgroundImage: 'var(--gradient-cta, linear-gradient(120deg, #FF5FB2 0%, #FFA66E 100%))' }}
            className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-1 shadow-[0_8px_20px_rgba(255,95,178,0.35)] hover:scale-110 active:scale-95 transition-all duration-300 border border-white/50 flex items-center justify-center cursor-pointer"
            title="Tanya IRIS Assistant"
          >
            <div className="w-full h-full rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center p-2 relative overflow-hidden">
              <img
                src="/logo-nobg.webp"
                alt="IRIS Logo"
                className="w-full h-full object-contain filter drop-shadow-md group-hover:rotate-6 transition-transform duration-300"
              />
            </div>
            {/* Online Glow Status Badge */}
            <span className="absolute bottom-0 right-0 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white shadow-sm"></span>
            </span>
          </button>
        </div>
      )}

      {/* Compact Modern Chat Modal (Fits 100% Zoom) */}
      {isOpen && (
        <div className="w-[320px] sm:w-[350px] max-h-[490px] sm:max-h-[520px] h-[78vh] rounded-3xl bg-white/95 backdrop-blur-2xl border border-pink-200/90 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
          
          {/* Header Banner - Exact Join Us CTA Gradient (#FF5FB2 to #FFA66E) */}
          <div
            style={{ backgroundImage: 'var(--gradient-cta, linear-gradient(120deg, #FF5FB2 0%, #FFA66E 100%))' }}
            className="relative px-4 py-3 text-white shadow-sm flex items-center justify-between shrink-0 select-none"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 p-0.5 border border-white/50 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                <img
                  src="/logo-nobg.webp"
                  alt="IRIS Logo"
                  className="w-7 h-7 object-contain drop-shadow"
                />
              </div>

              <div>
                <h3 className="font-bold text-sm text-white tracking-tight flex items-center gap-1.5 drop-shadow-xs">
                  IRIS Assistant
                </h3>
                <p className="text-[10px] text-white/90 flex items-center gap-1 mt-0.2 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 inline-block shadow-xs"></span>
                  Online
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                title="Minimize"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
                title="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container with Native & Fluid Mouse Wheel Scrolling */}
          <div
            onWheel={(e) => e.stopPropagation()}
            className="flex-1 p-3 overflow-y-auto overscroll-contain touch-pan-y scroll-smooth space-y-3 bg-slate-50/70 scrollbar-thin scrollbar-thumb-pink-300"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Message Bubble with HTML Formatted Markdown */}
                <div
                  style={
                    msg.sender === 'user'
                      ? { backgroundImage: 'var(--gradient-cta, linear-gradient(120deg, #FF5FB2 0%, #FFA66E 100%))' }
                      : undefined
                  }
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed transition-all shadow-xs ${
                    msg.sender === 'user'
                      ? 'text-white font-semibold rounded-tr-xs shadow-pink-200/50'
                      : 'bg-white text-slate-800 border border-pink-100 rounded-tl-xs shadow-sm font-normal'
                  }`}
                >
                  {msg.isLoading ? (
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] py-0.5 font-medium">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-pink-500" />
                      Menyusun jawaban...
                    </div>
                  ) : (
                    <div>{formatMessageText(msg.text, msg.sender === 'user')}</div>
                  )}

                  {/* Executed Action Badge */}
                  {msg.action && (
                    <div className="mt-1.5 pt-1 border-t border-pink-100 flex items-center gap-1 text-[10px] text-pink-700 font-mono font-medium">
                      <Compass className="w-3 h-3 text-pink-500 animate-spin" />
                      <span>Action: <strong>{msg.action.name}</strong> {msg.action.city ? `(${msg.action.city})` : msg.action.path ? `(${msg.action.path})` : ''}</span>
                    </div>
                  )}

                  {/* Cache Indicator Chip */}
                  {msg.cached && (
                    <div className="mt-1.5 pt-1 border-t border-emerald-100 flex items-center gap-1 text-[9px] text-emerald-700 font-mono">
                      <Zap className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />
                      <span>Cache Instant ({msg.latencyMs || '<50'}ms)</span>
                    </div>
                  )}
                </div>

                {/* Sources & Feedback for Assistant Messages */}
                {msg.sender === 'assistant' && !msg.isLoading && msg.id !== 'welcome-1' && (
                  <div className="mt-1.5 max-w-[88%] flex flex-col gap-1">
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {msg.sources.map((src, i) => (
                          <a
                            key={i}
                            href={src.url || '#'}
                            target={src.url?.startsWith('http') ? '_blank' : '_self'}
                            rel="noreferrer"
                            className="text-[10px] px-2 py-0.5 rounded-md bg-pink-100/80 hover:bg-pink-200/90 text-pink-900 border border-pink-200/80 flex items-center gap-1 transition-colors font-medium"
                          >
                            <span>📍 {src.title}</span>
                            <ExternalLink className="w-2 h-2 text-pink-600" />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Feedback Button */}
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 font-medium">
                      <span>Membantu?</span>
                      <button
                        onClick={() => handleFeedback(msg.id, msg.logId, 1)}
                        disabled={!!feedbackGiven[msg.id]}
                        className={`p-0.5 rounded hover:bg-slate-200 transition-colors ${
                          feedbackGiven[msg.id] === 1 ? 'text-emerald-600 font-bold' : 'hover:text-emerald-600'
                        }`}
                        title="Membantu"
                      >
                        <ThumbsUp className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleFeedback(msg.id, msg.logId, -1)}
                        disabled={!!feedbackGiven[msg.id]}
                        className={`p-0.5 rounded hover:bg-slate-200 transition-colors ${
                          feedbackGiven[msg.id] === -1 ? 'text-rose-500 font-bold' : 'hover:text-rose-500'
                        }`}
                        title="Kurang Membantu"
                      >
                        <ThumbsDown className="w-3 h-3" />
                      </button>
                      {feedbackGiven[msg.id] && (
                        <span className="text-[9px] text-emerald-600 flex items-center gap-0.5 font-medium">
                          <Check className="w-2.5 h-2.5" /> Makasih!
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Reply Suggested Questions (Collapsible Accordion) */}
          {!isLoading && (
            <div className="border-t border-pink-100 bg-white/90 shrink-0 select-none transition-all">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="w-full px-3 py-1.5 flex items-center justify-between text-[10px] font-semibold text-slate-500 hover:text-pink-600 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1">
                  <MessageSquare className="w-2.5 h-2.5 text-pink-500" />
                  Rekomendasi Pertanyaan
                  <span className="text-[9px] font-mono text-pink-500 bg-pink-50 px-1.5 py-0.2 rounded border border-pink-200/60 ml-1">
                    {pathname}
                  </span>
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                    showSuggestions ? 'rotate-180 text-pink-500' : ''
                  }`}
                />
              </button>

              {showSuggestions && (
                <div className="px-3 pb-2 pt-0.5 flex flex-wrap gap-1 animate-in fade-in duration-200">
                  {currentSuggestedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        handleSend(q);
                        setShowSuggestions(false);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-full bg-pink-50 hover:bg-pink-100 border border-pink-200/80 text-pink-900 font-medium transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Precision Input Bar */}
          <div className="p-3 bg-white border-t border-pink-100 flex flex-col gap-1 shrink-0">
            <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/70 focus-within:bg-white border border-pink-200 focus-within:border-pink-500 rounded-full pl-4 pr-1.5 py-1 transition-all shadow-inner">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Tanyakan sesuatu ke IRIS..."
                disabled={isLoading}
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none disabled:opacity-50 py-1.5 border-none outline-none ring-0"
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                style={{ backgroundImage: 'var(--gradient-cta, linear-gradient(120deg, #FF5FB2 0%, #FFA66E 100%))' }}
                className="w-8 h-8 rounded-full text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center shrink-0"
                title="Kirim"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                )}
              </button>
            </div>
            
            <p className="text-[9px] text-slate-400 text-center mt-0.5 font-medium select-none">
              Powered by <span className="text-pink-600 font-semibold">IRIS AI</span>
            </p>
          </div>

        </div>
      )}
    </div>
  );
}
