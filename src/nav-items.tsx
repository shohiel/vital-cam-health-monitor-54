
import { HomeIcon, ActivityIcon, User } from "lucide-react";
import Index from "./pages/Index.tsx";
import VitalsMonitor from "./pages/VitalsMonitor.tsx";
import Developer from "./pages/Developer.tsx";

export const navItems = [
  {
    title: "Home",
    to: "/",
    icon: <HomeIcon className="h-4 w-4" />,
    page: <Index />,
  },
  {
    title: "Vitals Monitor",
    to: "/vitals-monitor",
    icon: <ActivityIcon className="h-4 w-4" />,
    page: <VitalsMonitor />,
  },
  {
    title: "Developer",
    to: "/developer",
    icon: <User className="h-4 w-4" />,
    page: <Developer />,
  },
];
