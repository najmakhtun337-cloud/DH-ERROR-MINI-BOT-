const express = require("express");
const {
  default: makeWASocket,
  useMultiFileAuthState
} = require("@whiskeysockets/baileys");

const app = express();
app.use(express.static("public"));

let sock;

async function startBot(){
  const { state, saveCreds } = await useMultiFileAuthState("./session");

  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    if(update.connection === "open"){
      console.log("✅ DH ERROR WhatsApp Bot Connected");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text;

    if (text === "hi") {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "👋 Hello! DH ERROR Bot Active"
      });
    }
  });
}

app.get("/pair", async (req, res) => {
  const number = req.query.number;
  if(!number) return res.send("❌ Number required");

  try{
    const code = await sock.requestPairingCode(number);
    res.send("PAIR CODE: " + code);
  }catch(e){
    res.send("❌ Failed, try again");
  }
});

startBot();

app.listen(3000, () => {
  console.log("🤖 DH ERROR Mini Bot running on port 3000");
});
