import { createTRPCRouter } from "~/server/api/trpc";
import { eventRouter } from "./routers/event";
import { clubRouter } from "./routers/club";
import { adminRouter } from "./routers/admin";
import { studentRouter } from "./routers/student";


/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  student: studentRouter,
  event: eventRouter,
  club: clubRouter,
  admin: adminRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
