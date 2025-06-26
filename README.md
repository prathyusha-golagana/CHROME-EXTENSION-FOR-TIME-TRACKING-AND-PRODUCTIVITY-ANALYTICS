# CHROME-EXTENSION-FOR-TIME-TRACKING-AND-PRODUCTIVITY-ANALYTICS

COMPANY : CODTECH IT SOLUTIONS

NAME : Prathyusha Golagana

INTERN ID : CT04DF2741

DOMAIN : Full Stack Development

DURATION : 4 Weeks

MENTOR : NEELA SANTHOSH KUMAR

**DESCRIPTION :

## Overview

This project is a Chrome extension designed to help users track the time they spend on different websites and provide detailed productivity analytics. The extension automatically classifies websites as productive (such as coding platforms) or unproductive (such as social media), and generates daily and weekly productivity reports. It features a backend server with a MySQL database for persistent data storage and a dashboard for visualizing analytics.

## Features

- **Automatic Time Tracking:**  
  The extension monitors which websites you visit and how long you spend on each one, without requiring manual input.

- **Productivity Classification:**  
  Websites are automatically classified as Productive, Unproductive, or Neutral based on predefined lists. For example, coding and educational sites are considered productive, while social media and entertainment sites are considered unproductive.

- **Daily and Weekly Reports:**  
  The extension provides a popup with a summary of your productivity for the current day, and a dashboard with a weekly productivity report.

- **Dashboard Analytics:**  
  The dashboard displays a breakdown of time spent on productive, unproductive, and neutral sites, as well as total time tracked, using a simple and clean interface.

- **Backend Integration:**  
  All user data is stored in a MySQL database via a Node.js/Express backend, ensuring persistence and scalability.

- **Privacy:**  
  User data is stored locally and on your own backend. No data is shared with third parties.

## Folder Structure

chrome_extension/

├── assets/                 # Extension icons and images

├── backend/                # Backend server and database logic  

│   ├── server.js  

│   └── storage.js

├── dashboard/              # Dashboard UI and scripts  

│   ├── dashboard.js  

│   ├── dashboard.css  

│   └── index.html

├── src/                    # Extension source files  

│   ├── background.js 

│   ├── content.js  

│   ├── popup.js  

│   ├── popup.html  

│   ├── popup.css  

│   └── options.html

├── .gitignore              # Files and folders to ignore in Git

├── manifest.json           # Chrome extension manifest file

└── README.md               # Project documentation


## How It Works

1. **Tracking:**  
   The background script listens for tab changes and window focus events. When you switch tabs or windows, it records the time spent on the previous site and starts tracking the new one.

2. **Classification:**  
   Each domain is checked against lists of productive and unproductive sites. If a domain is not found in either list, it is classified as neutral.

3. **Data Storage:**  
   Time logs are sent to the backend server, which stores them in a MySQL database. Each log entry includes the user ID, domain, time spent (in seconds), classification type, and date.

4. **Analytics:**  
   The popup displays a summary of today’s stats. The dashboard page fetches and displays a weekly report, showing total time and breakdowns by productivity type.


## Backend

- **Tech Stack:** Node.js, Express, MySQL
- **Endpoints:**
  - `POST /api/log` — Log time spent on a domain.
  - `GET /api/today?user_id=...` — Get today’s stats for a user.
  - `GET /api/weekly?user_id=...` — Get weekly report for a user.

- **Database Table:**  
  `time_logs` with columns: `id`, `user_id`, `domain`, `seconds`, `type`, `day`.

## Extension Setup

Open Chrome and go to chrome://extensions/.

Enable "Developer mode".

Click "Load unpacked" and select the chrome_extension folder.

The extension icon will appear in the Chrome toolbar.

## Usage

Click the extension icon to view today’s productivity stats.

Click "Open Dashboard" in the popup to view the weekly analytics dashboard.

Visit different websites; the extension will automatically track and classify your activity.

## Customization

Productive/Unproductive Sites:

You can modify the lists in background.js to add or remove domains as needed.

Database Credentials:

Update the credentials in backend/server.js to match your MySQL setup.

## OUTPUT







