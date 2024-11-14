import { makeWASocket, useMultiFileAuthState, DisconnectReason } from "@whiskeysockets/baileys";
import pino from "pino";
import fs from "fs";

// Fungsi untuk login ke WhatsApp
export async function loginWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState("session");

        const socket = makeWASocket({
            auth: state,
            logger: pino({ level: "silent" }),
            printQRInTerminal: true,
        });

        socket.ev.on("creds.update", saveCreds);

        return new Promise((resolve) => {
            socket.ev.on("connection.update", async (update) => {
                const { connection, lastDisconnect } = update;

                if (connection === "open") {
                    console.log("Berhasil login ke WhatsApp!");
                    resolve(true);
                } else if (connection === "close") {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;

                    if (statusCode === DisconnectReason.loggedOut) {
                        console.log("Logout terdeteksi. Menghapus sesi dan menampilkan QR code baru.");

                        // Menghapus folder sesi secara manual
                        fs.rmSync("session", { recursive: true, force: true });

                        // Coba login ulang dengan QR code baru
                        loginWhatsApp().then((isLoggedIn) => resolve(isLoggedIn));
                    } else {
                        console.log("Koneksi tertutup. Mencoba login ulang...");
                        loginWhatsApp().then((isLoggedIn) => resolve(isLoggedIn));
                    }
                }
            });
        });
    } catch (error) {
        console.error("Error saat login:", error);
        return false;
    }
}


export const sendMessageWa = async (phone, message) => {
    try {
        const { state, saveCreds } = await useMultiFileAuthState("session");

        const socket = makeWASocket({
            auth: state,
            logger: pino({ level: "silent" }),
        });

        socket.ev.on("creds.update", saveCreds);

        const isConnected = await new Promise((resolve) => {
            socket.ev.on("connection.update", (update) => {
                const { connection, lastDisconnect } = update;

                if (connection === "open") {
                    console.log("Koneksi ke WhatsApp berhasil!");
                    resolve(true);
                } else if (connection === "close") {
                    const statusCode = lastDisconnect?.error?.output?.statusCode;
                    if (statusCode === DisconnectReason.loggedOut) {
                        console.log("Sesi telah habis, login ulang diperlukan.");
                        resolve(false);
                    }
                }
            });
        });

        if (!isConnected) {
            console.log("Tidak dapat mengirim pesan, koneksi gagal.");
            return false;
        }

        await socket.sendMessage(phone, { text: message });
        console.log("Pesan berhasil dikirim ke:", phone);
        return true;
    } catch (error) {
        console.error("Error saat mengirim pesan:", error);
        return false;
    }
};

