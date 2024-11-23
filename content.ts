import type { PlasmoCSConfig } from "plasmo"
import cssText from "data-text:./style.css"
import { fetchPromptsForCurrentWebsite, generateText } from "~ai-helper"

let prompts = [];

fetchPromptsForCurrentWebsite((filteredPrompts) => {
 prompts = filteredPrompts
});

// Extract body text
const getBodyText = () => {
  // Wait until the document is fully loaded, if not already
  if (document.readyState !== 'loading') {
      return getTextContent();
  }

  // If the document is still loading, use an event listener to wait for it
  document.addEventListener('DOMContentLoaded', () => {
      return getTextContent();
  });

  // Helper function to get clean text content
  function getTextContent() {
      let bodyText = document.body.innerText || document.body.textContent;

      // Additional sanitization or cleaning of text if needed
      bodyText = bodyText.replace(/[\n\r]+/g, ' ').trim();

      return bodyText;
  }
};


// Send body text to the extension's background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getBodyText") {
        sendResponse({ bodyText: getBodyText() });
    }
});



export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"],
  all_frames: true
}

// Inject styles
const style = document.createElement("style")
style.textContent = cssText
document.head.appendChild(style)

// Types
interface ContextMenuItem {
  title: string
  icon: string
  promptId?: string
}

// Create context menu
const createContextMenu = (items: ContextMenuItem[], targetId: string): HTMLElement => {
  const menu = document.createElement("div")
  menu.className = "plasmo-context-menu"
  menu.setAttribute("role", "listbox")
  menu.setAttribute('data-plasmo-menu', 'true')
  menu.setAttribute('data-target-id', targetId)
  menu.tabIndex = -1

  items.forEach((item, index) => {
    const option = document.createElement("div")
    option.className = "plasmo-menu-item"
    option.setAttribute("role", "option")
    option.setAttribute("data-promptId", item.promptId)
    option.innerHTML = `
      ${item.icon ? `<span class="material-icons">${item.icon}</span>` : ''}
      <span>${item.title}</span>
    `

    // Add click handler for each menu item
    option.addEventListener('click', (e) => {
      e.stopPropagation()
      handleMenuAction(parseInt(item.promptId), menu)
    })

    // Add mouse enter handler for highlighting
    option.addEventListener('mouseenter', () => {
      const items = menu.querySelectorAll('.plasmo-menu-item')
      items.forEach(item => item.classList.remove('selected'))
      option.classList.add('selected')
      selectedIndex = index
    })

    menu.appendChild(option)
  })

  return menu
}

// Handle text formatting
const applyFormatting = async (element: Element, promptId: number) => {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
    const start = element.selectionStart
    const end = element.selectionEnd

    if (start === null || end === null) return

    const text = element.value
    let selectedText = text.substring(start, end)
    selectedText = selectedText || text
    if (!selectedText) return

    let formattedText = ''

    element.value = 'Generating!!'
    const stream = await generateText(promptId, selectedText, prompts);

    for await (const chunk of stream) {
      formattedText = chunk;
      element.value = formattedText;
    }

    element.focus()
  }
}

let activeMenu: HTMLElement | null = null
let selectedIndex = -1

const handleMenuAction = async (action: number, menu: HTMLElement) => {
  const targetId = menu.getAttribute('data-target-id')
  const element = document.getElementById(targetId!)
  if (!element) return

  const loader = showLoader(element)

  try {
    await new Promise(resolve => setTimeout(resolve, 500)) // Reduced timeout for better UX
    applyFormatting(element, action)
  } finally {
    loader.remove()
    closeContextMenu()
  }
}

const closeContextMenu = () => {
  if (activeMenu) {
    activeMenu.remove()
    activeMenu = null
  }
  selectedIndex = -1
}

const handleKeyNavigation = (e: KeyboardEvent, menu: HTMLElement) => {
  const items = menu.querySelectorAll('.plasmo-menu-item')

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault()
      selectedIndex = (selectedIndex + 1) % items.length
      break
    case "ArrowUp":
      e.preventDefault()
      selectedIndex = selectedIndex <= 0 ? items.length - 1 : selectedIndex - 1
      break
    case "Enter":
      e.preventDefault()
      if (selectedIndex >= 0) {
        const selectedItem = items[selectedIndex] as HTMLElement
        const action = parseInt(selectedItem.getAttribute('data-action'), 10)
        if (action) handleMenuAction(action, menu)
      }
      break
    case "Escape":
      e.preventDefault()
      closeContextMenu()
      break
  }

  items.forEach((item, index) => {
    item.classList.toggle('selected', index === selectedIndex)
  })
}

const showLoader = (element: Element) => {
  const loader = document.createElement("div")
  loader.className = "plasmo-loader"
  element.parentElement?.appendChild(loader)
  return loader
}

// Initialize enhancement
const initializeEnhancement = () => {
  // Find editable elements
  const findEditableElements = (): Element[] => {
    const selector = 'textarea, [role="textbox"], [contenteditable="true"]'
    return Array.from(document.querySelectorAll(selector))
  }

  const createCornerButton = (element: Element): HTMLButtonElement => {
    const button = document.createElement("button");
    const icon = document.createElement("img");

    icon.src = chrome.runtime.getURL("assets/icon.png");
    icon.alt = "Extension Icon";
    icon.className = "plasmo-corner-button-icon";

    button.appendChild(icon);

    button.className = "plasmo-corner-button";
    button.setAttribute('data-plasmo-button', 'true');

    positionCornerButton(button, element);

    return button;
  }


  const positionCornerButton = (button: HTMLButtonElement, element: Element) => {
    const rect = element.getBoundingClientRect()
    button.style.left = `${rect.right - 24}px`
    button.style.top = `${rect.bottom - 24}px`
  }

  const showLoader = (element: Element) => {
    const loader = document.createElement("div")
    loader.className = "plasmo-loader"
    loader.setAttribute('data-plasmo-loader', 'true')
    element.parentElement?.appendChild(loader)
    return loader
  }

  const enhanceElement = (element: Element) => {
    if (element.hasAttribute('data-plasmo-enhanced')) return

    const uniqueId = `plasmo-element-${Math.random().toString(36).substr(2, 9)}`
    element.id = uniqueId
    element.setAttribute('data-plasmo-enhanced', 'true')

    const cornerButton = createCornerButton(element)
    document.body.appendChild(cornerButton)

    cornerButton.addEventListener('click', (e) => {
      e.stopPropagation()
      closeContextMenu()

      const menuitems = prompts.map((item, index) => {
        return { ...item, promptId: index.toString() };
      });

      const menu = createContextMenu(menuitems, uniqueId)
      const rect = cornerButton.getBoundingClientRect()
      menu.style.left = `${rect.right}px`
      menu.style.top = `${rect.top}px`

      document.body.appendChild(menu)
      activeMenu = menu

      menu.addEventListener('keydown', (e) => handleKeyNavigation(e, menu))
    })

    // Update corner button position
    const updatePosition = () => positionCornerButton(cornerButton, element)
    window.addEventListener('scroll', updatePosition, { passive: true })
    window.addEventListener('resize', updatePosition, { passive: true })
  }

  // Initialize observer for dynamic elements
  const observer = new MutationObserver((mutations) => {
    const addedNodes = new Set<Element>()

    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) {
          if (
            node.hasAttribute('data-plasmo-button') ||
            node.hasAttribute('data-plasmo-menu') ||
            node.hasAttribute('data-plasmo-loader')
          ) {
            return
          }

          if (node.matches('textarea, [role="textbox"], [contenteditable="true"]')) {
            addedNodes.add(node)
          }

          node.querySelectorAll('textarea, [role="textbox"], [contenteditable="true"]')
            .forEach(el => addedNodes.add(el as Element))
        }
      })
    })

    addedNodes.forEach(node => {
      if (!node.hasAttribute('data-plasmo-enhanced')) {
        enhanceElement(node)
      }
    })
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  // Initialize existing elements
  findEditableElements().forEach(element => {
    if (!element.hasAttribute('data-plasmo-enhanced')) {
      enhanceElement(element)
    }
  })

  // Close menu on outside click
  document.addEventListener('click', (e) => {
    if (activeMenu && !activeMenu.contains(e.target as Node)) {
      closeContextMenu()
    }
  })
}

// Start the enhancement
initializeEnhancement()


// tooltip code
  let selectedText = null;
  let position = null;

  // Create and inject the tooltip element
  const createTooltip = () => {
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
    tooltip.style.display = "none"; // Hidden initially
    document.body.appendChild(tooltip);
    return tooltip;
  };

  // Show the selection position
  const showSelectionPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      selectedText = selection.toString();
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      position = {
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
      };

      // Send a message to background to update context menu
      chrome.runtime.sendMessage({ action: "updateContextMenu" });
    }
  };

  // Listen for text selection
  const onSelectionChange = () => {
    showSelectionPosition();
  };

  // Add listener for outside click to hide the tooltip
  const addOutsideClickListener = () => {
    document.addEventListener("click", (event) => {
      const tooltip = document.getElementById("tooltip-container");

      if (tooltip && !tooltip.contains(event.target)) {
        const tooltips = document.getElementsByClassName('tooltip-class');

        // Loop through each element and set its display style to 'none'
        for (let i = 0; i < tooltips.length; i++) {
          tooltips[i].style.display = 'none';
        }
      }
    });
  };

  // Initialize the functionality
  const init = () => {
    // Create the tooltip
    createTooltip();

    // Monitor selection change
    window.addEventListener("mouseup", onSelectionChange);

    // Add listener for outside click to hide the tooltip
    addOutsideClickListener();
  };

  // Run initialization
  init();
