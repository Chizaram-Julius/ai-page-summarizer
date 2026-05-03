function extractReadableContent() {
  const clonedBody = document.body.cloneNode(true);

  const unwantedSelectors = [
    "script",
    "style",
    "nav",
    "footer",
    "header",
    "aside",
    "form",
    "button",
    "iframe",
    "noscript",
    "[role='navigation']",
    "[aria-hidden='true']",
  ];

  unwantedSelectors.forEach((selector) => {
    clonedBody.querySelectorAll(selector).forEach((element) => {
      element.remove();
    });
  });

  const preferredContent =
    document.querySelector("article") ||
    document.querySelector("main") ||
    clonedBody;

  const text = preferredContent.innerText.replace(/\s+/g, " ").trim();

  return {
    title: document.title || "Untitled Page",
    url: window.location.href,
    text: text.slice(0, 12000),
  };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || message.type !== "EXTRACT_PAGE_CONTENT") {
    return;
  }

  try {
    const pageData = extractReadableContent();

    if (!pageData.text || pageData.text.length < 100) {
      sendResponse({
        success: false,
        error: "Not enough readable content found on this page.",
      });
      return;
    }

    sendResponse({
      success: true,
      data: pageData,
    });
  } catch {
    sendResponse({
      success: false,
      error: "Failed to extract readable content.",
    });
  }
});
