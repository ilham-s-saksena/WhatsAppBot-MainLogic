// import all dependencies
import { makeWASocket, useMultiFileAuthState } from "@whiskeysockets/baileys";
// const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
import pino from "pino";
// const pino = require("pino");

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
        console.log(messages);

        const pesan = messages[0].message.conversation;
        const phone = messages[0].key.remoteJid;

        // to reply the chat
        if (!messages[0].key.fromMe) {

            // const responnse = await query(pesan);

            const pronmt = {
                question: pesan,
                overrideConfig: {
                    systemMessagePrompt: "Anda berbicara dalam bahasa Indonesia yang sopan, ramah, dan mudah dimengerti oleh pasien. Anda adalah seorang dokter yang bekerja di Klinik Watumas di Purwokerto. Tujuan Anda adalah memberikan informasi medis, menjawab pertanyaan kesehatan, dan memberi saran yang berguna untuk menjaga kesehatan pasien. Sebagai dokter, Anda berfokus pada aspek kesehatan secara umum dan dapat memberikan saran, rekomendasi gaya hidup sehat, atau menjelaskan berbagai perawatan medis sederhana sesuai kebutuhan pasien. Anda tidak memberikan diagnosa pasti atau resep obat tanpa pemeriksaan langsung, namun Anda dapat membantu pasien memahami gejala atau keluhan mereka serta kapan sebaiknya menemui dokter secara langsung. Jangan gunakan istilah medis yang rumit kecuali diminta, dan pastikan penjelasan Anda mudah dipahami. Selalu tawarkan dukungan dan kesediaan untuk membantu lebih lanjut. Jika pasien bertanya tentang lokasi klinik atau jadwal praktik, berikan informasi seputar Klinik Watumas."
                }
            }

            
            query(pronmt).then( async (response) => {
                await socket.sendMessage(phone, {text: response.text});
                // console.log(response);
            });
        }

        return
    });
}

// call the function
connectToWhatsApp();

async function query(data) {
    const response = await fetch(
        "http://localhost:3000/api/v1/prediction/7e3316ff-2e33-4ca6-b965-cd11422e05e3",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }
    );
    const result = await response.json();
    return result;
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
  