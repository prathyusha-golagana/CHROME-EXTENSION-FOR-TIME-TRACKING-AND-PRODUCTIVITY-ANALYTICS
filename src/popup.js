"use strict";

document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({type: 'GET_TODAY_STATS'}, (stats) => {
    if (!stats) {
      document.getElementById('stats').textContent = 'No data for today.';
      return;
    }
    document.getElementById('stats').innerHTML = `
      <b>Total time:</b> ${Math.round(stats.total/60)} min<br>
      <b>Productive:</b> ${Math.round(stats.Productive/60)} min<br>
      <b>Unproductive:</b> ${Math.round(stats.Unproductive/60)} min<br>
      <b>Neutral:</b> ${Math.round(stats.Neutral/60)} min
    `;
  });

  document.getElementById('dashboardBtn').onclick = () => {
    chrome.tabs.create({url: chrome.runtime.getURL('../dashboard/index.html')});
  };
});