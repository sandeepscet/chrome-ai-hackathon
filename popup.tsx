import React from "react";

const Popup = () => {
  const handleNewPrompt = () => {
    console.log("New prompt created");
  };

  const handleChatWithPage = () => {
    console.log("Chat initiated with current page");
  };

  return (
    <div className="p-4 w-80">
      <h1 className="text-xl font-bold mb-4">Extension Popup</h1>
      <button
        onClick={() => chrome.runtime.openOptionsPage()}
        className="w-full bg-gray-500 text-white py-2 px-4 rounded mt-4"
      >
        Open Options
      </button>
      <button
        onClick={handleChatWithPage}
        className="w-full bg-green-500 text-white py-2 px-4 rounded"
      >
        Chat with Current Page
      </button>
    </div>
  );
};

export default Popup;
