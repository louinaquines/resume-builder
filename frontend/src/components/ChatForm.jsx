import { useState, useEffect, useRef } from "react";
import { sendChatMessage } from "../api";

export default function ChatForm({ onResumeReady, loading }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [started, setStarted] = useState(false);
  const containerRef = useRef();
  const inputRef = useRef();

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const startChat = async () => {
    setStarted(true);
    setThinking(true);
    let aiText = "";

    await sendChatMessage(
      [],
      (chunk) => { aiText += chunk; },
      () => {
        setThinking(false);
        setMessages([{ role: "assistant", content: aiText }]);
        inputRef.current?.focus();
      }
    );
  };

  const sendMessage = async (overrideInput) => {
    const textToSend = typeof overrideInput === "string" ? overrideInput : input;
    if (!textToSend.trim() || thinking) return;

    const userMessage = { role: "user", content: textToSend.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    if (typeof overrideInput !== "string") setInput("");
    setThinking(true);

    let aiText = "";

    await sendChatMessage(
      newMessages,
      (chunk) => {
        aiText += chunk;
        // Stream AI response live
        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last?.streaming) {
            return [...prev.slice(0, -1), { role: "assistant", content: aiText, streaming: true }];
          }
          return [...prev, { role: "assistant", content: aiText, streaming: true }];
        });
      },
      () => {
        setThinking(false);
        let parsedData = null;
        let shouldTriggerResume = false;

        setMessages(prev => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            const finalText = last.content;
            if (finalText.includes("RESUME_READY:")) {
              const jsonStart = finalText.indexOf("RESUME_READY:") + "RESUME_READY:".length;
              shouldTriggerResume = true;
              try {
                parsedData = JSON.parse(finalText.slice(jsonStart).trim());
                return [...prev.slice(0, -1), {
                  role: "assistant",
                  content: "✨ Great! I have all the information I need. Generating your resume now...",
                }];
              } catch (e) {
                return [...prev.slice(0, -1), { role: "assistant", content: finalText }];
              }
            }
            return [...prev.slice(0, -1), { role: "assistant", content: finalText }];
          }
          return prev;
        });

        if (shouldTriggerResume && parsedData) {
          setTimeout(() => onResumeReady(parsedData), 0);
        }

        inputRef.current?.focus();
      }
    );
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!started) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px] gap-8 p-8">
        <div className="text-center space-y-4">
          <div className="text-5xl animate-bounce" style={{ animationDuration: '3s' }}>✨</div>
          <h2 className="text-2xl font-bold text-white tracking-wide">Let AI build your resume</h2>
          <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed">
            No forms to fill. Just answer a few questions in a natural conversation and your resume will be ready in minutes.
          </p>
        </div>
        <button
          onClick={startChat}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white px-8 py-3.5 rounded-xl font-bold shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300 transform hover:-translate-y-1">
          Start Building My Resume →
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ minHeight: "600px" }}>
      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto space-y-4 p-4 pr-2 scroll-smooth" style={{ maxHeight: "520px" }}>
        {messages.map((msg, i) => {
          const isLatestAi = msg.role === "assistant" && i === messages.length - 1;
          
          // Pattern to match message starting with "STEP X:"
          const stepMatch = msg.content.match(/(?:^|\n|\s)STEP\s*(\d+):/i);
          const currentStep = stepMatch ? stepMatch[1] : null;

          // Strip the "STEP X:" from what the user actually sees
          const textPart = stepMatch ? msg.content.replace(/^(?:\s*)STEP\s*\d+:\s*/i, "").trim() : msg.content;
          
          // Hardcoded options mapping so the AI doesn't have to hallucinate arrays
          const stepOptionsMap = {
            "2": ["Professional", "Friendly/Creative", "Bold/Modern"],
            "4": ["Minimalist", "Executive", "Tech-Focused"],
            "6": ["Applying for a Job", "Internship", "Freelance Gig"],
            "8": ["Short & Punchy", "Detailed & Academic"],
            "10": ["Deep Purple", "Electric Blue", "Classic Black", "Soft Green"]
          };

          const options = (currentStep && stepOptionsMap[currentStep]) ? stepOptionsMap[currentStep] : [];

          return (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] mr-3 flex-shrink-0 mt-0.5 shadow-md shadow-indigo-500/20 ring-1 ring-white/10">
                  AI
                </div>
              )}
              <div className={`max-w-[85%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-tr-sm shadow-indigo-500/20"
                  : "bg-white/5 backdrop-blur-md text-slate-200 rounded-tl-sm border border-white/10"
              }`}>
                <div className="flex flex-col gap-3">
                  <p className="whitespace-pre-wrap">{textPart}</p>
                  {isLatestAi && options.length > 0 && !thinking && (
                    <div className="flex flex-wrap gap-2 mt-2 flex-col sm:flex-row">
                      {options.map((opt, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => sendMessage(opt)}
                          className="bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-400/30 text-indigo-200 px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm hover:shadow-indigo-500/20 text-left"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {thinking && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-[10px] mr-3 flex-shrink-0 mt-0.5 shadow-md shadow-indigo-500/20 ring-1 ring-white/10">
              AI
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 bg-indigo-400/80 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}/>
                <span className="w-2.5 h-2.5 bg-indigo-400/80 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}/>
                <span className="w-2.5 h-2.5 bg-indigo-400/80 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}/>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-5 border-t border-white/5 bg-black/20">
        <div className="flex gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type your answer..."
            disabled={thinking || loading}
            rows={1}
            className="flex-1 bg-[#0a0a0f]/60 backdrop-blur-md border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 transition-all duration-300 shadow-inner"
          />
          <button
            onClick={sendMessage}
            disabled={thinking || loading || !input.trim()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-30 disabled:hover:scale-100 text-white px-5 py-3.5 rounded-xl transition-all duration-300 flex-shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_25px_rgba(99,102,241,0.5)] transform hover:scale-105">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}