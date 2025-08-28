// frontend/src/pages/Chatbot.jsx
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import useAuth from "../hooks/useAuth";
import { talkToBot, getHistory, deleteHistory } from "../api/chat";
import ChatMessage from "../components/ui/ChatMessage.jsx";
import ChatInput from "../components/ui/ChatInput.jsx";
import Button from "../components/ui/Button.jsx";

const Chatbot = () => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);

  const loadingMessage = {
    main: false,
    isLoading: true,
  };

  const hasFetchedHistory = useRef(false);
  const messagesEndRef = useRef(null);

  const addMessages = (...newMessages) =>
    setMessages((prev) => [...prev, ...newMessages]);

  const replaceLoadingWithResponse = (response) =>
    setMessages((prev) => {
      const updated = [...prev];
      const idx = updated.findIndex((msg) => msg.isLoading);
      if (idx !== -1) updated[idx] = { message: response, main: false };
      return updated;
    });

  const removeLoading = () =>
    setMessages((prev) => prev.filter((msg) => !msg.isLoading));

  const handleSend = async (text) => {
    const userMessage = { message: text, main: true };
    addMessages(userMessage, loadingMessage);
    try {
      const { success, message, response } = await talkToBot(
        token,
        text,
        user.sessionID
      );
      if (success && response) {
        replaceLoadingWithResponse(response);
      } else {
        removeLoading();
        toast.error(message);
      }
    } catch (error) {
      removeLoading();
      toast.error("Error al comunicarse con el bot");
    }
  };

  const deleteChat = () => {
    const messages_cache = messages;

    toast.promise(
      (async () => {
        setMessages([]); // Limpias mensajes al inicio
        const { success, message } = await deleteHistory(token);
        if (!success) {
          // Si falla, restauras los mensajes y lanzas error para el toast.promise
          setMessages(messages_cache);
          throw new Error(message || "No se pudo eliminar el historial");
        }
        return success;
      })(),
      {
        loading: "Eliminando historial...",
        success: "¡Historial borrado correctamente!",
        error: (err) => `Error al borrar: ${err.message}`,
      }
    );
  };

  // Scroll automático al final
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { success, response, message } = await getHistory(token);
        if (success) {
          // console.log("Historial del chat:", response);
          // Opcional: Si quieres mostrar el historial en el chat:
          const history = [];
          response
            .slice()
            .reverse()
            .forEach((item) => {
              if (item?.user) history.push({ message: item.user, main: true });
              if (item?.bot) history.push({ message: item.bot, main: false });
            });
          setMessages((prev) => [...prev, ...history]);
        } else {
          console.warn("No se pudo obtener el historial:", message);
          setMessages((prev) => [
            ...prev,
            { message: "¡Hola! ¿En qué puedo ayudarte hoy?", main: false },
          ]);
        }
      } catch (error) {
        console.error("Error al obtener el historial:", error);
        setMessages((prev) => [
          ...prev,
          { message: "¡Hola! ¿En qué puedo ayudarte hoy?", main: false },
        ]);
      }
    };

    if (token && !hasFetchedHistory.current) {
      hasFetchedHistory.current = true;
      fetchHistory();
    }
  }, [token]);

  return (
    <div className="flex flex-col flex-1 bg-white">
      {/* Mensajes con scroll interno */}
      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-2 mb-[5rem]">
        {messages.map((msg, idx) => (
          <ChatMessage
            key={idx}
            message={msg.message}
            main={msg.main}
            isLoading={msg.isLoading}
          />
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input fijo abajo */}
      <footer className="min-h-[5rem] px-[2rem] border-t bottom-0 right-0 left-0 fixed bg-white flex items-center justify-center gap-x-8">
        <Button
          className="mb-5 mt-3 max-w-40 min-w-30 bg-blue-600 hover:bg-blue-800 transition-all ease-in duration-200"
          onClick={deleteChat}
        >
          Nuevo Chat
        </Button>
        <ChatInput onSend={handleSend} />
      </footer>
    </div>
  );
};

export default Chatbot;
