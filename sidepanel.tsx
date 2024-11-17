import React, { useEffect, useState } from "react";

const Sidebar = () => {
    const [bodyText, setBodyText] = useState("Loading...");

    useEffect(() => {
        // Request body text from the content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, { action: "getBodyText" }, (response) => {
                if (response?.bodyText) {
                    setBodyText(response.bodyText);
                } else {
                    setBodyText("Failed to fetch page content.");
                }
            });
        });
    }, []);

    return (
        <div className="w-64 h-full bg-gray-100 p-4 shadow-lg">
            <h1 className="text-lg font-bold">Sidebar Panel</h1>
            <p className="text-sm whitespace-pre-wrap">{bodyText}</p>
        </div>
    );
};

export default Sidebar;
