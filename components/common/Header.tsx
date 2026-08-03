"use client";
import DrawerWithSides from "@/app/products/components/CartDrawer";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
export default function AppHeader() {
  const { setTheme, resolvedTheme } = useTheme();

  function ToggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  const router = useRouter();

  function navigate(type : 1 | 2) {
    if(type === 1){
    
      // admin order
      
     return router.push("/admin-orders");
    }
    router.push("/orders");
  }

  return (
    <header className=" flex flex-row justify-end gap-3">
      <div className="flex items-center gap-1">
        <Button className="rounded-full" onClick={ToggleTheme}>
          <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>


      <Button onClick={ () => navigate(1)} size="lg">
        View Admin Orders
      </Button>

      <Button onClick={ () => navigate(2)} size="lg">
        View Orders
      </Button>
      <DrawerWithSides />
    </header>
  );
}
