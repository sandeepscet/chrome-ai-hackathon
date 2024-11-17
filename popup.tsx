import React, { useEffect, useState } from "react";
import './popup.css';

const Popup = () => {
  const [currentTabId, setCurrentTabId] = useState<number | undefined>(undefined);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        setCurrentTabId(tabs[0].id);
      }
    });
  }, []);

  const handleNewPrompt = () => {
    console.log("New prompt created");
  };

  const handleChatWithPage = () => {
    console.log("Chat initiated with current page");
    // Use the currentTabId here
    if (currentTabId) {
      // Perform actions with the current tab ID
      console.log("Current tab ID:", currentTabId);
      chrome.sidePanel.open({ tabId: currentTabId });
    }

  };

  return (
    <div className="p-4 w-80">
      <h1 className="text-xl font-bold mb-4">Copilot</h1>
      <button
        onClick={() => chrome.runtime.openOptionsPage()}
        className="w-full bg-gray-500 text-white py-2 px-4 rounded mt-4 mb-4"
      >
        Options
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
