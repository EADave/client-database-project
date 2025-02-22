require('dotenv').config();
const express = require('express');
const Airtable = require('airtable');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Airtable with environment variables
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);
const tableName = process.env.AIRTABLE_TABLE_NAME;

// Example route: GET /userRecords?uid=someUserID
app.get('/userRecords', async (req, res) => {
  try {
    // 1) Get the user ID from the URL query (e.g., ?uid=someUserID)
    const userId = req.query.uid;
    if (!userId) {
      return res.status(400).send('Missing uid parameter');
    }

    // 2) Query Airtable to fetch only the records that match this user ID
    //    Make sure you have a field called "UserID" in your Airtable table
    const records = await base(tableName).select({
      filterByFormula: `{User ID} = "${userId}"`
    }).all();

    // 3) Build a basic HTML page
    let html = `
      <html>
      <head>
        <title>User Records</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h1>Your Submissions</h1>
    `;

    if (records.length === 0) {
      html += `<p>No records found for user: ${userId}</p>`;
    } else {
      html += `
        <table>
          <thead>
            <tr>
              <th>Record ID</th>
              <th>Data (example fields)</th>
            </tr>
          </thead>
          <tbody>
      `;

      // For each record, show some fields in a table row
      records.forEach(record => {
        html += `
          <tr>
            <td>${record.id}</td>
            <td>${JSON.stringify(record.fields)}</td>
          </tr>
        `;
      });

      html += `
          </tbody>
        </table>
      `;
    }

    html += `
      </body>
      </html>
    `;

    // Send the HTML
    res.send(html);

  } catch (error) {
    console.error('Error fetching user records:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
