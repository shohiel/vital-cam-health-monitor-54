
import { HomeIcon, ActivityIcon } from "lucide-react";
import Index from "./pages/Index.tsx";
import VitalsMonitor from "./pages/VitalsMonitor.tsx";

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
];
