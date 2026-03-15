import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { LandingPage } from "./components/pages/LandingPage";
import { CoursePlanPage } from "./components/pages/CoursePlanPage";
import { SessionDetailPage } from "./components/pages/SessionDetailPage";
import { NotFoundPage } from "./components/pages/NotFoundPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: LandingPage },
      { path: "kursplan", Component: CoursePlanPage },
      { path: "kursplan/:sessionId", Component: SessionDetailPage },
      { path: "*", Component: NotFoundPage },
    ],
  },
]);
