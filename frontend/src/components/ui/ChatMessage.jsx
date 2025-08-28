// frontend/src/components/ui/ChatMessage.jsx
import ReactMarkdown from "react-markdown";
import { SyncLoader } from "react-spinners";

const sanitizeMessage = (msg) => {
  if (typeof msg !== "string") msg = JSON.stringify(msg);

  return msg;
};

const ChatMessage = ({ message, main = true, isLoading = false }) => {
  return (
    <div className={`flex ${main ? "justify-end" : "justify-start"} my-2`}>
      <div
        className={`max-w-[50%] px-4 py-2 rounded-lg text-base break-words overflow-scroll ${
          main ? "bg-black text-white" : "bg-gray-200 text-black"
        }`}
      >
        {isLoading ? (
          <SyncLoader size={4} speedMultiplier={1} />
        ) : (
          <ReactMarkdown
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  className="text-blue-600 underline hover:text-blue-800"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
              ul: ({ node, ...props }) => (
                <ul
                  {...props}
                  className="list-disc pl-5 m-0 space-y-0 gap-0 py-0"
                />
              ),
              li: ({ node, ...props }) => <li {...props} className="m-0 p-0" />,
            }}
            children={sanitizeMessage(message)}
            skipHtml={true}
            linkify={true}
          />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
