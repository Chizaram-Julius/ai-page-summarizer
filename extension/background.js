const API_URL = "http://localhost:4000/api/summarize";

function isValidSummarizeMessage(message) {
  return (
    message &&
    message.type === "SUMMARIZE_PAGE" &&
    message.payload &&
    typeof message.payload.title === "string" &&
    typeof message.payload.url === "string" &&
    typeof message.payload.text === "string"
  );
}

async function getCachedSummary(url) {
  const key = `summary:${url}`;
  const result = await chrome.storage.local.get(key);
  return result[key] || null;
}

async function saveCachedSummary(url, summary) {
  const key = `summary:${url}`;
  await chrome.storage.local.set({
    [key]: {
      ...summary,
      cachedAt: Date.now(),
    },
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!isValidSummarizeMessage(message)) {
    sendResponse({
      success: false,
      error: "Invalid message received.",
    });
    return;
  }

  summarizePage(message.payload)
    .then(sendResponse)
    .catch((error) => {
      console.error("Message handling error:", error);

      sendResponse({
        success: false,
        error: "Unexpected background service worker error.",
      });
    });

  return true; // Required for async response
});

async function summarizePage(pageData) {
  try {
    const cachedSummary = await getCachedSummary(pageData.url);

    if (cachedSummary) {
      return {
        success: true,
        cached: true,
        data: cachedSummary,
      };
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pageData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      return {
        success: false,
        error:
          errorData?.error ||
          `Backend request failed with status ${response.status}`,
      };
    }

    const summary = await response.json();

    await saveCachedSummary(pageData.url, summary);

    return {
      success: true,
      cached: false,
      data: summary,
    };
  } catch (error) {
    console.error("Background service worker error:", error);

    return {
      success: false,
      error: "Unexpected background service worker error.",
    };
  }
}
