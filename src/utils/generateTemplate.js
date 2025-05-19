// templates/templateGenerator.js
export const getTemplate = (data) => {
  return `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          .card {
            border: 1px solid #ccc;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            width: 500px;
            margin: auto;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>You're Invited!</h1>
          <p><strong>Guest Name:</strong> ${data.guestName}</p>
          <p><strong>Event:</strong> ${data.eventName}</p>
          <p><strong>Date:</strong> ${data.date}</p>
          <p><strong>Venue:</strong> ${data.venue}</p>
        </div>
      </body>
    </html>
  `;
};
