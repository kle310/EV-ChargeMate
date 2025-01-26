import { Router } from 'express';
import { chatController } from '../controllers/chatController';
import { StationModel } from '../models/stationModel';

export const createChatRouter = (stationModel: StationModel): Router => {
  const router = Router();
  const controller = chatController(stationModel);

  // Route to render the chat interface
  router.get('/chat', controller.renderChat);

  // Route to handle chat messages
  router.post('/api/chat', controller.handleMessage);

  return router;
};
