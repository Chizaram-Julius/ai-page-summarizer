const pageTitle = document.getElementById("pageTitle");
const summarizeBtn = document.getElementById("summarizeBtn");
const clearBtn = document.getElementById("clearBtn");
const copyBtn = document.getElementById("copyBtn");

const loading = document.getElementById("loading");
const error = document.getElementById("error");
const summaryBox = document.getElementById("summaryBox");

const readingTime = document.getElementById("readingTime");
const wordCount = document.getElementById("wordCount");
const summaryList = document.getElementById("summaryList");
const insightsList = document.getElementById("insightsList");

let currentSummaryText = "";

document.addEventListener("DOMContentLoaded", loadCurrentTabTitle);
summarizeBtn.addEventListener("click", handleSummarize);
clearBtn.addEventListener("click", clearUI);
copyBtn.addEventListener("click", copySummary);

async function loadCurrentTabTitle() {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  pageTitle.textContent = tab?.title || "Current Page";
}

async function handleSummarize() {
  setLoading(true);
  hideError();
  clearSummary();

  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab?.id) {
      showError("No active tab found.");
      return;
    }

    const extracted = await chrome.tabs.sendMessage(tab.id, {
      type: "EXTRACT_PAGE_CONTENT",
    });

    if (!extracted.success) {
      showError(extracted.error);
      return;
    }

    const result = await chrome.runtime.sendMessage({
      type: "SUMMARIZE_PAGE",
      payload: extracted.data,
    });

    if (!result.success) {
      showError(result.error);
      return;
    }

    renderSummary(result.data);
  } catch {
    showError("Could not summarize this page. Refresh the page and try again.");
  } finally {
    setLoading(false);
  }
}

function renderSummary(data) {
  summaryBox.classList.remove("hidden");

  readingTime.textContent = data.estimatedReadingTime || "Unknown";
  wordCount.textContent = data.wordCount || "Unknown";

  renderList(summaryList, data.summary || []);
  renderList(insightsList, data.keyInsights || []);

  currentSummaryText = [
    "Summary:",
    ...(data.summary || []).map((item) => `- ${item}`),
    "",
    "Key Insights:",
    ...(data.keyInsights || []).map((item) => `- ${item}`),
  ].join("\n");
}

function renderList(container, items) {
  container.textContent = "";

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    container.appendChild(li);
  });
}

async function copySummary() {
  if (!currentSummaryText) return;

  await navigator.clipboard.writeText(currentSummaryText);
  copyBtn.textContent = "Copied!";

  setTimeout(() => {
    copyBtn.textContent = "Copy Summary";
  }, 1200);
}

function setLoading(isLoading) {
  summarizeBtn.disabled = isLoading;
  loading.classList.toggle("hidden", !isLoading);
}

function showError(message) {
  error.textContent = message;
  error.classList.remove("hidden");
}

function hideError() {
  error.textContent = "";
  error.classList.add("hidden");
}

function clearUI() {
  hideError();
  clearSummary();
}

function clearSummary() {
  summaryBox.classList.add("hidden");
  summaryList.textContent = "";
  insightsList.textContent = "";
  readingTime.textContent = "";
  wordCount.textContent = "";
  currentSummaryText = "";
}
