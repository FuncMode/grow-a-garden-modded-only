require('dotenv').config();
const express = require('express');
const app = express();
const PORT = 3000;

const TOKEN = process.env.TOKEN;

const ROBLOX_SCRIPT = `
print("Secure Roblox script running!")
-- dito mo ilalagay ang buong code mo
`;

app.get('/script', (req, res) => {
  const token = req.query.token;
  if (token !== TOKEN) {
    return res.status(403).send('Forbidden: Invalid Token');
  }
  res.type('text/plain').send(ROBLOX_SCRIPT);
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
