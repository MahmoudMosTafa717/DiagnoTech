const generateResetEmail = (resetCode) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              text-align: center;
              padding: 20px;
          }
          .email-container {
              background: white;
              padding: 20px;
              border-radius: 10px;
              box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
              max-width: 400px;
              margin: auto;
          }
          h2 {
              color: #333;
          }
          .reset-code {
              font-size: 24px;
              font-weight: bold;
              color: #d9534f;
              padding: 10px;
              border: 2px dashed #d9534f;
              display: inline-block;
              margin-top: 10px;
          }
          p {
              color: #666;
          }
          .footer {
              margin-top: 20px;
              font-size: 12px;
              color: #999;
          }
      </style>
  </head>
  <body>
      <div class="email-container">
          <h2>Password Reset Request</h2>
          <p>Use the following code to reset your password:</p>
          <div class="reset-code">${resetCode}</div>
          <p>This code is valid for <strong>15 minutes</strong>. If you did not request this, please ignore this email.</p>
          <p class="footer">© 2024 DiagnoTech. All rights reserved.</p>
      </div>
  </body>
  </html>
  `;
};

module.exports = generateResetEmail;
