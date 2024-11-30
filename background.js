chrome.runtime.onInstalled.addListener(async () => {
  const seedPrompts = [
      {
          "description": "Automatically detect and correct any grammatical errors, spelling mistakes, and typographical issues in their text",
          "icon": "",
          "id": "e5fc6265-8f4c-44fe-a27e-60b3ca39d55a",
          "role": "Content writer",
          "title": "Grammerly",
          "website": ""
      },
      {
          "description": "Adjust the tone of writing more formal and professional",
          "icon": "",
          "id": "e5fc6265-8f4c-44fe-a27e-60b3ca39d55b",
          "role": "Content Writer",
          "title": "Formal Writer",
          "website": ""
      },
      {
          "description": "Adjust the tone of writing more casual suited to social media",
          "icon": "",
          "id": "e5fc6265-8f4c-44fe-a27e-60b3ca39d55c",
          "role": "Social Media Content Writer",
          "title": "Casual Writer",
          "website": ""
      },
      {
          "description": "Convert the following text into Gen Z lingo and slang, making it sound more casual, trendy, and relevant to younger audiences. Use popular terms, abbreviations, and expressions commonly used on social media and in digital conversations.",
          "icon": "",
          "id": "e5fc6265-8f4c-44fe-a27e-60b3ca39d55d",
          "role": "Content Writer",
          "title": "Genz",
          "website": ""
      }
  ];

  const existingData = await chrome.storage.local.get("prompts")
  const prompts = existingData?.prompts;

  if (!prompts || (prompts && prompts.length === 0)) {
    await chrome.storage.local.set({ prompts: seedPrompts });
    console.log("Seed data added to storage")
  } else {
    console.log("Data already exists, not adding seed data.")
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateContextMenu") {
    // Remove existing context menu items to avoid duplicates
    chrome.contextMenus.removeAll(() => {
      const options = ["Summarize", "ELI5", "Simplify"];
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
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const selectedText = info.selectionText;
  if (info.menuItemId && selectedText) {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: removeAllTooltips,
      args: [],
    });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: showTooltip,
      args: ['Loading...'],
    });

    const result = await performAction(info.menuItemId, selectedText);
     chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: removeAllTooltips,
      args: [],
    });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: showTooltip,
      args: [result],
    });
  }
});

// Simulate async API call (for demonstration purposes)
const performAction = async (action, selectedText) => {
  switch (action) {
    case 'Summarize':
      const options = {
        sharedContext: "This is web page content",
        type: 'key-points',
        format: 'markdown',
      };

      const available = (await ai.summarizer.capabilities()).available;
      let summarizer;
      if (available === 'no') {
        return await 'The Summarizer API isnt usable';
      }

      if (available === 'readily') {
        try {
          summarizer = await ai.summarizer.create(options);
          await summarizer.ready;
          const summary = await summarizer.summarize(selectedText, {
            context: 'This article is intended for a web audience.',
          });
          return summary;
        } catch (error) {
          console.log(error);
          return "error while getting summary";
        }
      }
      return 'Not available';

    default:
      let prompt = 'explain';

      switch (action) {
        case 'ELI5':
          prompt = 'Explain me provided input like i am five year old in simpler words';
          break;

        case 'Simplify':
          prompt = 'Explain me provided sentence in easy to understand simpler words';
          break;
      }

      return await generateAIText(selectedText, prompt);
  }
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
  tooltip.style.maxWidth = "90vw";
  tooltip.style.maxHeight = "90vh";
  tooltip.style.fontSize = "15px";
  tooltip.style.zIndex = "9999";
  tooltip.style.display = "block";
  tooltip.textContent = result;
  document.body.appendChild(tooltip);

  // Position the tooltip relative to the selected text
  const selection = window.getSelection();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  tooltip.style.top = `${rect.top + window.scrollY + 40}px`;
  tooltip.style.left = `${rect.left + window.scrollX}px`;
};

const generateAIText = async (text , prompt) => {
    const capabilities = await ai.languageModel.capabilities();

    if (!capabilities.available) {
        return await 'AI Model not available';
    }

    if (prompt) {
      const promptText = `${prompt} to given input in Triple Backticks. Input:\`\`\`${text}\`\`\`. Make sure to reply with just output text without any context or output information. response should be directl, usable and without surrounding quotes`
      console.log({promptText})

      try {
          const session = await ai.languageModel.create({
          systemPrompt: "Pretend to be a role of good content writer"
        });

         return await session.prompt(promptText);
      } catch (error) {
        alert(error.message || error)
        return await "Error in AI model response.";
      }
    }

    return await "Error in extention. please email us.";
}

function removeAllTooltips() {
  const tooltips = document.getElementsByClassName('tooltip-class');

  Array.from(tooltips).forEach(tooltip => {
    tooltip.remove();
  });
}
