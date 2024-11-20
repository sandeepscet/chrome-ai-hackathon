chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateContextMenu") {
    // Remove existing context menu items to avoid duplicates
    chrome.contextMenus.removeAll(() => {
      const options = ["Summarize", "Translate", "Simplify"];
      options.forEach((option) => {
        chrome.contextMenus.create({
          id: option,
          title: option,
          contexts: ["selection"], // Show only when text is selected
        });
      });
    });
  }
});

// Handle right-click context menu selection
chrome.contextMenus.onClicked.addListener((info, tab) => {
  const selectedText = info.selectionText;
  if (info.menuItemId && selectedText) {
    // Simulate async API call
    simulateApiCall(info.menuItemId, selectedText).then((result) => {
      // Send message to content script to show tooltip with the result
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: showTooltip,
        args: [result],
      });
    });
  }
});

// Simulate async API call (for demonstration purposes)
const simulateApiCall = (action, selectedText) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`${action} result for: "${selectedText}"`);
    }, 1000);
  });
};

// Show the tooltip on the page
const showTooltip = (result) => {
  const tooltip = document.createElement("div");
  tooltip.id = "tooltip-container";
   tooltip.className = "tooltip-class";
  tooltip.style.position = "absolute";
  tooltip.style.backgroundColor = "#333";
  tooltip.style.color = "#fff";
  tooltip.style.padding = "10px";
  tooltip.style.borderRadius = "4px";
  tooltip.style.maxWidth = "250px";
  tooltip.style.fontSize = "12px";
  tooltip.style.zIndex = "9999";
  tooltip.style.display = "block"; // Show tooltip
  tooltip.textContent = result;
  document.body.appendChild(tooltip);

  // Position the tooltip relative to the selected text
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  tooltip.style.top = `${rect.top + window.scrollY + 40}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;
};
