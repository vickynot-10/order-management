"use client";

import DrawerWithSides from "@/app/(client)/products/components/CartDrawer";
import AuthModal from "@/components/common/AuthModal";
import { useTheme } from "next-themes";
import { Moon, Sun, ShieldCheck, Package } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function AppHeader() {
  const { setTheme, resolvedTheme } = useTheme();
  const router = useRouter();

  function ToggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  function navigate() {
    
      router.push("/orders");
    
  }

  return (
    <header className="flex flex-row items-center justify-end gap-2">
      <Tooltip>
        <TooltipTrigger >
          <Button
            variant="outline"
            size="icon"
            className="rounded-full relative"
            onClick={ToggleTheme}
          >
            <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Toggle theme</TooltipContent>
      </Tooltip>


      <Tooltip>
        <TooltipTrigger >
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={navigate}
          >
            <Package className="h-4 w-4" />
            <span className="sr-only">View Orders</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>View Orders</TooltipContent>
      </Tooltip>

      <AuthModal />

      <DrawerWithSides />
    </header>
  );
}