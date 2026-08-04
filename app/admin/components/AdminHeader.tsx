"use client";
import { LogOut } from "lucide-react";
import { useAdminLogout } from "@/hooks/queries/useAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdminHeader() {
  const { mutate } = useAdminLogout();

  const handleLogout = () => {
    mutate();
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-3 border-b bg-background">
      <div className="flex items-center gap-6">
        <span className="font-medium">Admin</span>
      </div>

      <AlertDialog>
        <AlertDialogTrigger>
          <button className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors">
            <LogOut size={16} />
            Logout
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of the admin panel?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Sign out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}
