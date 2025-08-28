// frontend/src/components/ui/ChatInput.jsx
import { useState, useRef, useEffect } from "react";
import Button from "./Button.jsx";

const ChatInput = ({
  onSend,
  limit = __MY_ENV__.LIMIT.MAX_CHAR_USER_MESSAGE,
}) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;
    onSend(input);
    setInput("");
  };

  // Auto-ajustar altura del textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto"; // Reinicia altura
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + "px"; // Máximo 150px
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center w-full h-full gap-8 mb-5 mt-3"
    >
      <label htmlFor="chat-input" className="sr-only">
        Escribe un mensaje
      </label>
      <textarea
        id="chat-input"
        aria-label="Escribe un mensaje"
        ref={textareaRef}
        className="h-auto flex-1 bg-white border border-gray-400 rounded-2xl px-3 py-2 resize-none overflow-y-auto leading-relaxed max-h-[10rem] focus:outline-none text-base shadow"
        placeholder="Escribe un mensaje..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        maxLength={limit}
      />
      <Button type="submit" className="max-w-50">
        Enviar
      </Button>
    </form>
  );
};

export default ChatInput;
