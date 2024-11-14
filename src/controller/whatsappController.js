import { sendMessageWa, loginWhatsApp } from "../services/whatsappService.js";

export const sendMessage = async (req, res) => {
    const { phone } = req.params;

    console.log(phone);

    if (!req.body.text) {
        return res.status(422).json({message: "Text Field is Required!"});
    }

    if (await sendMessageWa(`${phone}@s.whatsapp.net`, req.body.text)) {
    
        return res.status(200).json({message: `Sending WhatsApp to ${phone}`, text: req.body.text});
    } else {
        return res.status(500).json({message: "errors"});
        
    }

}

export const waLogin = async (req, res) => {
    if (loginWhatsApp()) {
        
        return res.status(200).json({message: "login success"});
    } else {
        return res.status(500).json({message: "errors"});
        
    }
    
}