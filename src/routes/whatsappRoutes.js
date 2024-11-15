import { Router } from "express";
import {
  sendMessage,
  waLogin,
  waDestroy,
} from "../controller/whatsappController.js";

const waRouter = Router();

waRouter.post('/send/:phone', sendMessage);

waRouter.get('/login-qr', waLogin);

waRouter.delete('/destroy', waDestroy);

export default waRouter;