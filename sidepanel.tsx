import React, { useEffect, useState } from "react";
import Chat from 'components/ChatHome';

const Sidebar = () => {
    const [bodyText, setBodyText] = useState("");

    useEffect(() => {
        const intervalId = setInterval(() => {
            fetchBodyText();
        }, 10000); // Fetch body content every 10 seconds

        return () => clearInterval(intervalId); // Clear the interval when the component unmounts
    }, []);

    useEffect(() => {
        fetchBodyText();

        chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
            if (tabId === tab.id && changeInfo.status === "complete") {
                fetchBodyText();
            }
        });

        return () => {
            chrome.tabs.onUpdated.removeListener(fetchBodyText);
        };

    }, []);

    const fetchBodyText = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "getBodyText" }, (response) => {
                    console.log('from sidebar:', response?.bodyText);
                    if (response?.bodyText && response.bodyText != 'Failed to fetch page content.') {
                        setBodyText(response.bodyText);
                    } else {
                        setBodyText("Failed to fetch page content.");
                    }
                });
            }
        });
    };

    return (
        <>
            <Chat bodyText={bodyText} />
        </>
    );
};

export default Sidebar;
