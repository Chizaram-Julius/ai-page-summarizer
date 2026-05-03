AI Page Summarizer Chrome Extension (HNG Stage 4A)

## Overview

This project is a Chrome Extension built using Manifest V3 that extracts meaningful content from a webpage, sends it securely to an AI API, and displays a structured summary.

The extension provides:

- Bullet-point summary
- Key insights
- Estimated reading time
- Word count
  This project strictly follows HNG Stage 4A requirements, including secure API handling, proper Chrome extension architecture, and clean UI/UX.

## Features

- Extracts readable content from webpages
- Ignores navigation, sidebar, and clutter
- Generates AI-powered summaries
- Displays structured output (bullet summary + key insights)
- Shows estimated reading time and word count
- Uses chrome.storage to cache results
- Clean, responsive popup UI
- Loading and error states
- Copy summary functionality

## Architecture

Popup UI → Content Script → Background Service Worker → Backend Server → OpenAI API

Explanation

- Popup UI: Handles user interaction and displays results
- Content Script: Extracts readable page content
- Background Service Worker: Handles messaging and API communication
- Backend Server: Secures API key and communicates with OpenAI
- AI API: Generates structured summary output

## Stack

Chrome Extension:

- Vanilla HTML
- Vanilla CSS
- Vanilla JavaScript
- Manifest V3

Backend:

- Node.js
- Express.js
- OpenAI Responses API

Storage:

- chrome.storage.local

## Security Decisions

- API key is stored only in server/.env
- API key is NOT exposed in frontend code
- .env is ignored via .gitignore
- .env.example is provided for setup reference
- All API requests go through a backend proxy
- Message validation implemented in background script
- AI responses are rendered using textContent to prevent XSS

## AI Integration

• Uses OpenAI Responses API from the backend
• Sends extracted webpage content to AI
• Receives structured JSON response
• Parses and displays:

1. Summary
2. Key insights
3. Reading time
4. Word count

## Trade-offs

- Requires backend server to run locally
- Some websites may limit content extraction
- Heuristic content filtering may not work perfectly on all pages
- AI usage depends on available API quota

## Setup Instructions

1. Clone the repository

- git clone https://github.com/YOUR_USERNAME/ai-page-summarizer.git
- cd ai-page-summarizer

2. Setup backend

- cd server
- npm install
- Create .env file:
  OPENAI_API_KEY=your_api_key_here
  PORT=4000
- Start backend:
- npm run dev

3. Load Chrome Extension

- Open Chrome
- Go to chrome://extensions
- Enable Developer Mode
- Click "Load unpacked"
- Select the extension folder

## Usage

- Open any article page
- Click the extension icon
- Click "Summarize Page"
- View summary, key insights, reading time, and word count

## Project Structure

ai-page-summarizer/
│
├── extension/
│ ├── manifest.json
│ ├── popup.html
│ ├── popup.css
│ ├── popup.js
│ ├── background.js
│ ├── content.js
│
├── server/
│ ├── server.js
│ ├── package.json
│ ├── .env.example
│
├── .gitignore
└── README.md

## Testing

- Works on multiple article pages
- Handles loading and error states gracefully
- Prevents duplicate API calls using cache
- No exposed API keys
- No console errors

## Demo Video

[Paste your video link here]

## HNG Stage 4A Compliance

This project satisfies:

- Manifest V3 setup
- Background service worker
- Popup UI requirements
- Content extraction
- Secure AI integration
- chrome.storage usage
- Clean architecture
- Error handling
- Security best practices
