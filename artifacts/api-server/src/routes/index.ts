import { Router, type IRouter } from "express";
import healthRouter from "./health";
import roomsRouter from "./rooms";
import runCodeRouter from "./run-code";

const router: IRouter = Router();

router.use(healthRouter);
router.use(roomsRouter);
router.use(runCodeRouter);

export default router;
