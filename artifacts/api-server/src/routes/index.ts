import { Router, type IRouter } from "express";
import healthRouter from "./health";
import profileRouter from "./profile";
import exercisesRouter from "./exercises";
import plansRouter from "./plans";
import sessionsRouter from "./sessions";
import maxesRouter from "./maxes";
import dexaRouter from "./dexa";
import checkinsRouter from "./checkins";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(profileRouter);
router.use(exercisesRouter);
router.use(plansRouter);
router.use(sessionsRouter);
router.use(maxesRouter);
router.use(dexaRouter);
router.use(checkinsRouter);
router.use(dashboardRouter);

export default router;
