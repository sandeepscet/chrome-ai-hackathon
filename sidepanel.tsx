import React, { useEffect, useState } from "react";
import Chat from 'components/ChatHome';

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
        <>
        <Chat bodyText={bodyText}/>
        </>
    );
};

export default Sidebar;
