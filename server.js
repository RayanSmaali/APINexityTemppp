const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(cors());
app.use('/api/get/*', (req, res) => {
    const dynamicPath = req.params[0];
    const token = process.env.EASYVISTA_API_TOKEN;
    const url = process.env.BASE_URL;
    fetch(`${url}/${dynamicPath}`, {
        method: "GET",
        headers: {
          "Authorization" : `Bearer ${token}`
        }
      })
    .then(response => response.json())
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ error: err.message }));
});
app.put('/api/confirm/actions/:rfc_number', async (req, res) => {
  const { rfc_number } = req.params;
  const token = process.env.EASYVISTA_API_TOKEN;
  const url = process.env.BASE_URL;

  const requestBody = {
      "end_action": {
          "description": "Closed by STEM API",
          "doneby_name": "API, Stem"
      }
  };

  try {
      const response = await fetch(`${url}/actions/${rfc_number}`, {
          method: "PUT",
          headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
          },
          body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
          throw new Error(`Erreur API EasyVista : ${response.statusText}`);
      }

      const data = await response.json();
      res.json({ message: `Ticket ${rfc_number} terminé avec succès`, data });
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

app.listen(8080, () => console.log('Proxy running on port 8080'));
