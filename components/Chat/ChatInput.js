import { useEffect, useRef, useState } from "react";

const ChatInput = ({ onSend, onReset }) => {
  const [content, setContent] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {

  }, [])

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length > 4000) {
      alert("Message limit is 4000 characters");
      return;
    }

    setContent(value);
  };



  const handleSend = () => {
    if (!content) {
      alert("Please enter a message");
      return;
    }
    onSend({ role: "user", content });
    setContent("");
  };

   const handleReset = () => {
    onReset()
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef && textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${textareaRef.current?.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        className="min-h-[44px] rounded-lg pl-4 pr-12 py-2 w-full focus:outline-none focus:ring-1 focus:ring-neutral-300 border-2 border-neutral-200"
        style={{ resize: "none" }}
        placeholder="Type a message..."
        value={content}
        rows={1}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <button onClick={() => handleSend()}>
        <p className="absolute  bottom-3 h-8 w-8 hover:cursor-pointer rounded-full p-1 bg-blue-700 text-white hover:opacity-80" style={{'right':'2.5rem'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M3 20v-6l8-2l-8-2V4l19 8l-19 8Z"/></svg>
        </p>
      </button>
      <button onClick={() => handleReset()}>
        <p className="absolute bottom-3 h-8 w-8 hover:cursor-pointer rounded-full p-1 bg-gray-500 text-white hover:opacity-80" style={{'right':'0.3rem'}}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 20.95q-3.025-.375-5.013-2.637T4 13q0-1.65.65-3.163T6.5 7.2l1.425 1.425q-.95.85-1.438 1.975T6 13q0 2.2 1.4 3.888T11 18.95v2Zm2 0v-2q2.175-.4 3.588-2.075T18 13q0-2.5-1.75-4.25T12 7h-.075l1.1 1.1l-1.4 1.4l-3.5-3.5l3.5-3.5l1.4 1.4l-1.1 1.1H12q3.35 0 5.675 2.325T20 13q0 3.025-1.988 5.288T13 20.95Z"/></svg>
        </p>
      </button>
    </div>
  );
};

export default ChatInput;
