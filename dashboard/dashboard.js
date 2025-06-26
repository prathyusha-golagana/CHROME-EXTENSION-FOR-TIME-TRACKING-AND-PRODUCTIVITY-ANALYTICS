"use strict";

// Placeholder for dashboard logic: load and display analytics, charts, weekly report.

window.onload = function() {
  chrome.runtime.sendMessage({type: 'GET_WEEKLY_REPORT'}, (report) => {
    if (!report) {
      document.getElementById('analytics').textContent = 'No data available.';
      return;
    }
    const total = (report.Productive || 0) + (report.Unproductive || 0) + (report.Neutral || 0);
    document.getElementById('analytics').innerHTML = `
      <h3>Weekly Productivity Report</h3>
      <ul>
        <li><b>Productive:</b> ${Math.round((report.Productive || 0)/60)} min</li>
        <li><b>Unproductive:</b> ${Math.round((report.Unproductive || 0)/60)} min</li>
        <li><b>Neutral:</b> ${Math.round((report.Neutral || 0)/60)} min</li>
        <li><b>Total:</b> ${Math.round(total/60)} min</li>
      </ul>
    `;
  });
};