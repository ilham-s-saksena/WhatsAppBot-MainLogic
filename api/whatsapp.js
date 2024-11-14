// Import all dependencies
const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
const pino = require("pino");

let socket; // Simpan socket untuk koneksi yang persisten

// Main function to connect to WhatsApp
async function connectToWhatsApp() {
  // Cek jika sudah ada koneksi sebelumnya
  if (socket) {
    console.log("WhatsApp already connected");
    return;
  }

  // Saving the session login to session files
  const authState = await useMultiFileAuthState("session");

  // Creating Connection
  socket = makeWASocket({
    printQRInTerminal: true,
    browser: ["linux", "mozila", "24.04"],
    auth: authState.state,
    logger: pino({ level: "silent" })
  });

  // Save credentials
  socket.ev.on("creds.update", authState.saveCreds);

  // Checking the WhatsApp Connection
  socket.ev.on("connection.update", ({ connection, qr }) => {
    if (connection === "open") {
      console.log("WhatsApp Active");
    } else if (connection === "close") {
      console.log("WhatsApp Closed. Reconnecting...");
      socket = null;
      connectToWhatsApp(); // Reconnect if closed
    } else if (connection === "connecting") {
      console.log("WhatsApp Connecting");
    }
    if (qr) {
      console.log("Scan QR Code: ", qr);
    }
  });

  // Event listener for incoming messages
  socket.ev.on("messages.upsert", async ({ messages }) => {
    console.log(messages);

    const message = messages[0];
    const pesan = message.message?.conversation || "";
    const phone = message.key.remoteJid;

    // Auto-reply logic
    if (!message.key.fromMe && pesan) {
      const response = "Hallo, ini adalah balasan otomatis!";
      await socket.sendMessage(phone, { text: response });
    }
  });
}

// Serverless function handler
export default async function handler(req, res) {
  if (req.method === "GET") {
    // Start the WhatsApp connection
    try {
      await connectToWhatsApp();
      res.status(200).json({ message: "WhatsApp Bot is running!" });
    } catch (error) {
      console.error("Error connecting to WhatsApp:", error);
      res.status(500).json({ error: "Failed to connect to WhatsApp" });
    }
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}
