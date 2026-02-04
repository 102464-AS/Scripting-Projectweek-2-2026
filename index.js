// importeren van modules
const express = require('express')
const app = express()
const port = 3000
const fs = require("fs");

app.use(express.urlencoded({ extended: true }));

// default route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
})

// status route
app.get('/status', (req, res) => {
  // pakt de data van data.json
  let data
  
  try {
    const rawData = fs.readFileSync("data.json", "utf8");
    data = JSON.parse(rawData)
  } catch (err) {
    console.error("Fout bij het lezen naar data.json:", err);
    return res.status(500).send("Serverfout: kan data bestand niet openen");
  }

  res.json(data)
})

// action route
app.post("/action", (req, res) => {
  try {
    // controleer of er een actie is meegestuurd
    const keuze = req.body.actie;
    if (!keuze) {
      return res.status(400).send("Fout: Geen actie opgegeven");
    }

    const thrusterStatus = req.body['sensor1'] ?? false;
    const lifeSupport = req.body['sensor2'] ?? false;

    // lees de data uit data.json
    let rawData;
    try {
      rawData = fs.readFileSync("data.json", "utf8");
    } catch (err) {
      console.error("Fout bij het lezen van data.json:", err);
      return res.status(500).send("Serverfout: kan data bestand niet lezen");
    }

    let data;
    try {
      data = JSON.parse(rawData);
    } catch (err) {
      console.error("Ongeldige JSON in data.json:", err);
      return res.status(500).send("Serverfout: ongeldige JSON");
    }

    const batterijpercentage = data[0]?.batterijpercentage ?? 0;
    const temperatuur = data[0]?.temperatuur ?? 0;
    const ijzers = data[0]?.ijzers ?? "onbekend";

    // maak nieuwe array met geüpdatete data
    const nieuwe_data = [
      {
        batterijpercentage,
        temperatuur,
        ijzers,
        thrusterStatus,
        lifeSupport,
        action: keuze
      }
    ];

    try {
      fs.writeFileSync("data.json", JSON.stringify(nieuwe_data, null, 2));
    } catch (err) {
      console.error("Fout bij het schrijven naar data.json:", err);
      return res.status(500).send("Serverfout: kan data bestand niet bijwerken");
    }

    res.send("JSON bestand succesvol bijgewerkt");
  } catch (err) {
    console.error("Onverwachte fout in /action:", err);
    res.status(500).send("Serverfout: onverwachte fout");
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
