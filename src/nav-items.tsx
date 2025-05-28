
import { HomeIcon, User, Activity, Code } from "lucide-react";
import Index from "./pages/Index.tsx";
import VitalsMonitor from "./pages/VitalsMonitor.tsx";
import NehalDeveloper from "./pages/NehalDeveloper.tsx";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Vitals Monitor",
    to: "/vitals",
    icon: <Activity className="h-4 w-4" />,
    page: <VitalsMonitor />,
  },
  {
    title: "Developer",
    to: "/developer-nehal",
    icon: <Code className="h-4 w-4" />,
    page: <NehalDeveloper />,
  },
];
