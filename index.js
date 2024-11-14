import express from 'express';
const app = express();
import waRouter from "./src/routes/whatsappRoutes.js"

// root route
app.get('/', (req, res) => {
    res.status(200)
    .send({
        'message' : 'server is runing'
    });
});
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/wa', waRouter);

app.get('*', (req, res) => {
    res.status(404)
    .send({
        'message' : 'not found'
    });
});

app.listen(3000, () => {
    console.log('server is runing on http://localhost:3000');
});


// -------------------------------------------------------------------------------------

// // import all dependencies
// const { makeWASocket, useMultiFileAuthState } = require("@whiskeysockets/baileys");
// const pino = require("pino");

// // create main function
// async function connectToWhatsApp(){

//     //saving the session login to sessions files
//     const authState = await useMultiFileAuthState("session");

//     // Creating Connection
//     const socket = makeWASocket({
//         printQRInTerminal: true,
//         browser: ["linux", "mozila", "24.04"],
//         auth: authState.state,
//         logger: pino({level: "silent"})
//     });

//     // idk
//     socket.ev.on('creds.update', authState.saveCreds);

//     // Checking the WhatsApp Connection
//     socket.ev.on('connection.update', ({connection, qr}) => {
//         if (connection == 'open') {
//             console.log("WhatsApp Active");
//         } else if (connection == 'close') {
//             // to reconnecting
//             console.log("Whatsapp Close");
//             connectToWhatsApp();
//         } else if (connection == "connecting") {
//             console.log("WhatsApp Connecting");
//         }
//         if (qr) {
//             // display qrcode in terminal
//             console.log(qr);
//         }
//     });

//     //add event listener from chat has coming
//     socket.ev.on("messages.upsert", async ({messages}) => {
//         console.log(messages);

//         const pesan = messages[0].message.conversation;
//         const phone = messages[0].key.remoteJid;

//         // to reply the chat
//         if (!messages[0].key.fromMe) {
//             const responnse = "Hallo, ini adalah balasan otomatis!";
//             await socket.sendMessage(phone, {text: responnse});
//         }

//         return
//     });
// }

// // call the function
// connectToWhatsApp();




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
  