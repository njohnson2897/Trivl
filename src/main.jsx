import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import Quiz from "./pages/Quiz.jsx";
import Results from "./pages/Results.jsx";
import ErrorPage from "./pages/ErrorPage.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Settings from "./pages/Settings.jsx";
import Help from "./pages/Help.jsx";
import Profile from "./pages/Profile.jsx";
import FriendsList from "./pages/FriendsList.jsx";
import QuizHistory from "./pages/QuizHistory.jsx";
import Achievements from "./pages/Achievements.jsx";
import Instructions from "./pages/Instructions.jsx";
import UserList from "./pages/UserList.jsx";
import Notifications from "./pages/Notifications.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Quiz /> },
      { path: "results", element: <Results /> },
      { path: "leaderboard", element: <Leaderboard /> },
      { path: "settings", element: <Settings /> },
      { path: "help", element: <Help /> },
      { path: "profile", element: <Profile /> },
      { path: "friends", element: <FriendsList /> },
      { path: "quiz-history", element: <QuizHistory /> },
      { path: "achievements", element: <Achievements /> },
      { path: "instructions", element: <Instructions /> },
      { path: "user-list", element: <UserList /> },
      { path: "notifications", element: <Notifications /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);