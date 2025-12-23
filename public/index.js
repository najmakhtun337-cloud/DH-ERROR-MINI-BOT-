const express = require("express");
const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");

const app = express();
app.use(express.static("public"));

let sock;

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (u) => {
    if (u.connection === "open") {
      console.log("✅ DH ERROR WhatsApp Connected");
    }
  });
}

app.get("/pair", async (req, res) => {
  try {
    const number = req.query.number;
    if (!number) return res.send("❌ Number missing");
    const code = await sock.requestPairingCode(number);
    res.send("PAIR CODE: " + code);
  } catch {
    res.send("❌ Try again");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log("🤖 DH ERROR Mini Bot running on", PORT)
);

startBot();
