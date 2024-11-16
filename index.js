// import all dependencies
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
// const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
import pino from "pino";
// const pino = require("pino");
import undici from "undici";
// const undici = require('undici');

// create main function
async function connectToWhatsApp(){

    //saving the session login to sessions files
    const authState = await useMultiFileAuthState("session");

    // Creating Connection
    const socket = makeWASocket({
        printQRInTerminal: true,
        browser: ["linux", "mozila", "24.04"],
        auth: authState.state,
        logger: pino({level: "silent"})
    });

    // idk
    socket.ev.on('creds.update', authState.saveCreds);

    // Checking the WhatsApp Connection
    socket.ev.on('connection.update', ({connection, qr}) => {
        if (connection == 'open') {
            console.log("WhatsApp Active");
        } else if (connection == 'close') {
            // to reconnecting
            console.log("Whatsapp Close");
            connectToWhatsApp();
        } else if (connection == "connecting") {
            console.log("WhatsApp Connecting");
        }
        if (qr) {
            // display qrcode in terminal
            console.log(qr);
        }
    });

    //add event listener from chat has coming
    socket.ev.on("messages.upsert", async ({messages}) => {
        try {
            console.log(messages);

            const pesan = messages[0].message.conversation;
            const phone = messages[0].key.remoteJid;
            // to reply the chat
            if (!messages[0].key.fromMe && messages[0].key.remoteJid != 'status@broadcast') {

                // const responnse = await query(pesan);
                const pronmt = {
                    question: pesan,
                    overrideConfig: {
                        systemMessagePrompt: "Anda adalah seorang psikiater profesional yang berbicara dalam bahasa Indonesia. Peran Anda adalah mendengarkan dengan empati, memberikan dukungan emosional, dan membantu pasien memahami serta mengatasi masalah psikologis atau emosional mereka. Anda menggunakan bahasa yang sopan, ramah, dan penuh pengertian. Selalu bersikap sabar, mendengarkan dengan baik, dan menyesuaikan jawaban Anda agar relevan dengan kebutuhan pasien.",
                        sessionId: phone,
                        chat_history: phone
                    },
                    sessionId: phone,
                    chat_history: phone
                }

                try {
                    query(pronmt).then(async (response) => {
                        await socket.sendMessage(phone, {text: response.text});
                    }).catch(async (error) => {
                        console.error("Error saat query:", error);
                        await socket.sendMessage(phone, {text: "Ups, terjadi masalah. Silakan coba lagi."});
                    });
                } catch (error) {
                    if (error.code === 'UND_ERR_HEADERS_TIMEOUT') {
                        await socket.sendMessage(phone, {text: "Maaf, server terlalu lambat merespons. Silakan coba lagi nanti."});
                    } else {
                        await socket.sendMessage(phone, {text: "Terjadi error. Silakan coba lagi."});
                    }
                }
            }
            return;
        } catch (error) {
            console.error("Error saat handling messages.upsert:", error);
        }
    });
}

// call the function
connectToWhatsApp();

async function query(data) {
    try {
        const response = await fetch(
            "http://localhost:3000/api/v1/prediction/7e3316ff-2e33-4ca6-b965-cd11422e05e3",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        return result;
        
    } catch (error) { // Perbaiki dari `err` menjadi `error`
        console.error("Error saat query:", error); // Log detail error
        throw new Error(`Query failed: ${error.message}`);
    }
}





// Here is the array key and value from the variabel messages

// [
//     {
//         key: {
//             remoteJid: '6281225378954@s.whatsapp.net',
//             fromMe: false,
//             id: '612B624CDC227ABE7225729738E425E1',
//             participant: undefined
//         },
//         messageTimestamp: 1731599132,
//         pushName: 'ilham.',
//         broadcast: false,
//         message: Message {
//             conversation: 'halloow',
//             messageContextInfo: [MessageContextInfo]
//         }
//     }
// ]
  