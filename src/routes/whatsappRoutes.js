import { Router } from "express";
import {
  sendMessage,
  waLogin,
} from "../controller/whatsappController.js";

const waRouter = Router();

waRouter.post('/send/:phone', sendMessage);

waRouter.get('/login-qr', waLogin);

export default waRouter;