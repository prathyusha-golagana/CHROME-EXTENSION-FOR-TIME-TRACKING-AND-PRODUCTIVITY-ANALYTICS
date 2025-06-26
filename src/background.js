"use strict";

const BACKEND_URL = 'http://localhost:3000/api'; // Change if deployed

const PRODUCTIVE_DOMAINS = [
  "leetcode.com", "github.com", "stackoverflow.com", "w3schools.com", "geeksforgeeks.org"
];
const UNPRODUCTIVE_DOMAINS = [
  "facebook.com", "instagram.com", "twitter.com", "youtube.com", "reddit.com"
];

function classifyDomain(domain) {
  if (PRODUCTIVE_DOMAINS.some(d => domain.includes(d))) return "Productive";
  if (UNPRODUCTIVE_DOMAINS.some(d => domain.includes(d))) return "Unproductive";
  return "Neutral";
}

function getTodayDate() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}

async function getUserId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['user_id'], (result) => {
      if (result.user_id) {
        resolve(result.user_id);
      } else {
        const id = 'user_' + Math.random().toString(36).substr(2, 9);
        chrome.storage.local.set({user_id: id}, () => resolve(id));
      }
    });
  });
}

console.log("Background script loaded");

async function saveTimeForDomain(domain, seconds) {
  const type = classifyDomain(domain);
  try {
    const user_id = await getUserId();
    if (!user_id) {
      console.error('No user_id available, aborting saveTimeForDomain');
      return false;
    }
    console.log(`Logging time: user_id=${user_id}, domain=${domain}, seconds=${seconds}, type=${type}`);
    const res = await fetch(`${BACKEND_URL}/log`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        user_id,
        domain,
        seconds,
        type,
        day: getTodayDate()
      })
    });
    if (!res.ok) {
      console.error('Failed to log time:', res.status, await res.text());
    }
    return res.ok;
  } catch (err) {
    console.error('Error logging time:', err);
    return false;
  }
}

async function getTodayStats() {
  try {
    const user_id = await getUserId();
    if (!user_id) {
      console.error('No user_id available, aborting getTodayStats');
      return null;
    }
    console.log(`Fetching today stats for user_id=${user_id}`);
    const res = await fetch(`${BACKEND_URL}/today?user_id=${encodeURIComponent(user_id)}`);
    if (!res.ok) {
      console.error('Failed to fetch today stats:', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const stats = {Productive: 0, Unproductive: 0, Neutral: 0, total: 0, details: {}};
    for (const row of data) {
      const seconds = Number(row.seconds); // Ensure it's a number
      stats[row.type] += seconds;
      stats.total += seconds;
      stats.details[row.domain] = {seconds, type: row.type};
    }
    console.log('Today stats:', stats);
    return stats;
  } catch (err) {
    console.error('Error fetching today stats:', err);
    return null;
  }
}

async function getWeeklyReport() {
  try {
    const user_id = await getUserId();
    if (!user_id) {
      console.error('No user_id available, aborting getWeeklyReport');
      return null;
    }
    console.log(`Fetching weekly report for user_id=${user_id}`);
    const res = await fetch(`${BACKEND_URL}/weekly?user_id=${encodeURIComponent(user_id)}`);
    if (!res.ok) {
      console.error('Failed to fetch weekly report:', res.status, await res.text());
      return null;
    }
    const data = await res.json();
    const report = {};
    for (const row of data) {
      report[row.type] = Number(row.seconds); // Ensure it's a number
    }
    console.log('Weekly report:', report);
    return report;
  } catch (err) {
    console.error('Error fetching weekly report:', err);
    return null;
  }
}

let activeTabId = null;
let activeDomain = null;
let startTime = null;

function getDomain(url) {
  try {
    const parsed = new URL(url);
    // Ignore chrome-extension:// and chrome:// URLs
    if (parsed.protocol === 'chrome:' || parsed.protocol === 'chrome-extension:') {
      return null;
    }
    return parsed.hostname || null;
  } catch {
    return null;
  }
}

async function handleTabChange(tabId, url) {
  const now = Date.now();
  if (activeTabId !== null && activeDomain && startTime) {
    const duration = Math.floor((now - startTime) / 1000);
    if (duration > 0 && activeDomain) { // Only log if domain is valid
      await saveTimeForDomain(activeDomain, duration);
    }
  }
  const domain = getDomain(url);
  if (!domain) {
    // Don't track internal Chrome pages
    activeTabId = null;
    activeDomain = null;
    startTime = null;
    return;
  }
  activeTabId = tabId;
  activeDomain = domain;
  startTime = now;
}

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  const tab = await chrome.tabs.get(activeInfo.tabId);
  if (tab && tab.url) {
    handleTabChange(tab.id, tab.url);
  }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    handleTabChange(tabId, changeInfo.url);
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // User left Chrome
    if (activeTabId && activeDomain && startTime) {
      const now = Date.now();
      const duration = Math.floor((now - startTime) / 1000);
      if (duration > 0) {
        await saveTimeForDomain(activeDomain, duration);
      }
      activeTabId = null;
      activeDomain = null;
      startTime = null;
    }
  } else {
    // Focused back, update active tab
    chrome.tabs.query({active: true, windowId}, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        handleTabChange(tabs[0].id, tabs[0].url);
      }
    });
  }
});

// Listen for popup/dashboard requests
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  console.log("Received message:", msg);
  if (msg.type === 'GET_TODAY_STATS') {
    getTodayStats().then(sendResponse);
    return true;
  }
  if (msg.type === 'GET_WEEKLY_REPORT') {
    getWeeklyReport().then(sendResponse);
    return true;
  }
});