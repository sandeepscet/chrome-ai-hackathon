import React, { useRef , useEffect, useState } from "react";
import Chat from "components/Chat/Chat";
import Footer from "components/Layout/Footer";
import Navbar from "components/Layout/Navbar";
import './chat.css';

const ChatHome = ({ bodyText }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aisession, setAisession] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(async () => {
      bodyText
       const session = await ai.languageModel.create({
        initialPrompts: [
          { role: "system", content: `Act as a expert Teacher and answer questions from provided content. content: ${bodyText}` },
        ]
      });
      session.addEventListener("contextoverflow", () => {
        console.log("Prompt API Token overflow, Report to Chrome!!");
      });

      setAisession(session)
    }, []);

   const getAnswer = async (question) => {
    const freshSession = await aisession.clone();
    return await freshSession.prompt(question);
  }

  const scrollToBottom = () => {
    if (messagesEndRef) {
      messagesEndRef.current?.scrollIntoView({ alignToTop:true, behavior: "smooth" });
    }
  };

  const handleSend = async (message) => {
    const updatedMessages = [...messages, message];

    setMessages(updatedMessages);
    setLoading(true);

    const response = await getAnswer(message);

    if (!response) {
      setLoading(false);
      throw new Error(response);
    }

    const data = response;

    if (!data) {
      return;
    }

    setLoading(false);

     setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          const updatedMessage = {
            ...lastMessage,
            role: "assistant",
            content: response
          };
          return [...messages, updatedMessage];
        });
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: `Hello there! I'm your AI assistant. How can I assist you today?`
      }
    ]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: `Hello there! I'm your AI assistant. How can I assist you today?`
      }
    ]);
  }, []);



  return (
    <>
      <div className="flex flex-col h-screen"  style={{'justifyContent':'flex-end',  'minHeight': '400px'}}>
        <Navbar />

        <div className="flex-1 overflow-auto sm:px-10 pb-4 sm:pb-10">
          <div className="mx-auto mt-4 sm:mt-12">
            <Chat
              messages={messages}
              loading={loading}
              onSend={handleSend}
              onReset={handleReset}
            />
            <div ref={messagesEndRef} className="messagesEndRef"/>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default ChatHome;
