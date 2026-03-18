import { Router, type IRouter } from "express";
import healthRouter from "./health";
import roomsRouter from "./rooms";
import runCodeRouter from "./run-code";
import aiChatRouter from "./ai-chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(roomsRouter);
router.use(runCodeRouter);
router.use(aiChatRouter);

export default router;
