import { toBold } from './utils.js';

// Function to create or update the context menu
function setupContextMenu() {
  chrome.contextMenus.create({
    id: "formatToBold",
    title: chrome.i18n.getMessage("contextMenuTitle"), // Use i18n message
    contexts: ["selection"] // Only show when text is selected
  });
}

// Create context menu item on installation or update
chrome.runtime.onInstalled.addListener(() => {
  setupContextMenu();
});

// Re-create context menu on browser startup (in case it was removed)
chrome.runtime.onStartup.addListener(() => {
  setupContextMenu();
});


// Listener for context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "formatToBold" && info.selectionText) {
    // Execute script in the active tab to format the selected text
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: formatSelectedText,
      args: [info.selectionText]
    });
  }
});

// This function will be executed in the context of the web page
function formatSelectedText(selectedText) {
  // Define the bold conversion function within the execution context
  // (Cannot directly import 'utils.js' here)
  const boldMap = {
    'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶',
    'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿',
    's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇',
    'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜',
    'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥',
    'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
    '0': '𝟬', '1': '𝟭', '2': '𝟮', '3': '𝟯', '4': '𝟰', '5': '𝟱', '6': '𝟲', '7': '𝟳', '8': '𝟴', '9': '𝟵'
  };

  function toBold(text) {
    return text.split('').map(char => boldMap[char] || char).join('');
  }

  const boldText = toBold(selectedText);

  // Try to insert the bold text back into the active element (input/textarea)
  try {
    const activeElement = document.activeElement;

    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      const text = activeElement.value;

      activeElement.value = text.slice(0, start) + boldText + text.slice(end);
      activeElement.selectionStart = activeElement.selectionEnd = start + boldText.length;
      activeElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));

    } else if (activeElement && activeElement.isContentEditable) {
        // Handle contentEditable elements
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            const range = selection.getRangeAt(0);
            range.deleteContents(); // Remove selected text
            range.insertNode(document.createTextNode(boldText)); // Insert bold text

            // Move cursor to the end of the inserted text
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);

             // Trigger input event for frameworks listening on the parent
            activeElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        } else {
             console.warn("Could not insert bold text into contentEditable: No selection range found.");
             // Fallback or alert if needed
        }
    }
     else {
      console.warn("Could not directly insert bold text. Active element is not a standard input, textarea, or contentEditable.");
      // Fallback: Copy to clipboard (requires clipboardWrite permission, which we have)
      navigator.clipboard.writeText(boldText).then(() => {
        // Maybe provide feedback? Alert might be intrusive.
        console.log('Bold text copied to clipboard as fallback.');
      }).catch(err => {
        console.error('Failed to copy text as fallback: ', err);
      });
    }
  } catch (error) {
    console.error("Error formatting text:", error);
  }
}
