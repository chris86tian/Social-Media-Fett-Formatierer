// Replicate the bold mapping and function here for simplicity
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
  if (!text) return '';
  return text.split('').map(char => boldMap[char] || char).join('');
}

// Function to set localized text for elements
function localizeHtmlPage() {
    // Localize elements with data-i18n-content attribute
    const i18nElements = document.querySelectorAll('[data-i18n-content]');
    i18nElements.forEach(element => {
        const messageKey = element.getAttribute('data-i18n-content');
        element.textContent = chrome.i18n.getMessage(messageKey);
    });

    // Localize elements with data-i18n-placeholder attribute
    const i18nPlaceholders = document.querySelectorAll('[data-i18n-placeholder]');
    i18nPlaceholders.forEach(element => {
        const messageKey = element.getAttribute('data-i18n-placeholder');
        element.placeholder = chrome.i18n.getMessage(messageKey);
    });

     // Localize elements with data-i18n-title attribute (like the page title)
    const i18nTitles = document.querySelectorAll('[data-i18n-title]');
    i18nTitles.forEach(element => {
        const messageKey = element.getAttribute('data-i18n-title');
        element.title = chrome.i18n.getMessage(messageKey);
    });

    // Special case for the document title itself
    document.title = chrome.i18n.getMessage("popupTitle");
}


// Get DOM elements
const inputText = document.getElementById('inputText');
const outputText = document.getElementById('outputText');
const copyButton = document.getElementById('copyButton');

// --- Run localization ---
localizeHtmlPage();
// --- --- --- --- --- ---

// Store original button text for resetting
const originalCopyButtonText = copyButton.textContent; // Get text *after* localization
const copiedButtonText = chrome.i18n.getMessage("popupCopyButtonCopied");
const errorButtonText = chrome.i18n.getMessage("popupCopyButtonError");


// Update output when input changes
inputText.addEventListener('input', () => {
  const originalText = inputText.value;
  const boldedText = toBold(originalText);
  outputText.textContent = boldedText; // Use textContent to display Unicode correctly
});

// Copy to clipboard when button is clicked
copyButton.addEventListener('click', () => {
  const textToCopy = outputText.textContent;
  if (textToCopy) {
    navigator.clipboard.writeText(textToCopy).then(() => {
      // Provide visual feedback using localized text
      copyButton.textContent = copiedButtonText;
      copyButton.classList.add('copied');
      setTimeout(() => {
        copyButton.textContent = originalCopyButtonText; // Reset to original localized text
        copyButton.classList.remove('copied');
      }, 1500); // Reset after 1.5 seconds
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      // Optionally display an error message to the user using localized text
      copyButton.textContent = errorButtonText;
       setTimeout(() => {
        copyButton.textContent = originalCopyButtonText; // Reset to original localized text
      }, 2000);
    });
  }
});

// Initial conversion if there's already text (e.g., from a previous session)
if (inputText.value) {
    outputText.textContent = toBold(inputText.value);
}
