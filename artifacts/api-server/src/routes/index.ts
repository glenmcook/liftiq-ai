import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import profileRouter from "./profile";
import exercisesRouter from "./exercises";
import plansRouter from "./plans";
import sessionsRouter from "./sessions";
import maxesRouter from "./maxes";
import dexaRouter from "./dexa";
import checkinsRouter from "./checkins";
import dashboardRouter from "./dashboard";
import dietRouter from "./diet";
import stripeRouter from "./stripe";
import pushRouter from "./push";
import { requireSession } from "../middlewares/requireSession";

const router: IRouter = Router();

// Applied here (not in app.ts) because requireSession's public-path check
// compares against req.path with the /api prefix already stripped, which
// only holds once we're inside this router (mounted at app.use("/api", ...)).
router.use(requireSession);

router.use(healthRouter);
router.use(authRouter);
router.use(profileRouter);
router.use(exercisesRouter);
router.use(plansRouter);
router.use(sessionsRouter);
router.use(maxesRouter);
router.use(dexaRouter);
router.use(checkinsRouter);
router.use(dashboardRouter);
router.use(dietRouter);
router.use(stripeRouter);
router.use(pushRouter);

export default router;
