"use client";

import { useRef } from "react";
import { LogOut } from "lucide-react";
import { useMe } from "@/hooks/queries/useMe";

export default function AdminHeader() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const openConfirm = () => dialogRef.current?.showModal();
  const closeConfirm = () => dialogRef.current?.close();

  const handleLogout = async () => {
    closeConfirm();
    // await signOut({ redirect: true, callbackUrl: "/login" });
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-3 border-b bg-background">
      <span className="font-medium">Admin</span>

      <button
        onClick={openConfirm}
        className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
      >
        <LogOut size={16} />
        Logout
      </button>

      <dialog
        ref={dialogRef}
        className="rounded-lg p-6 w-[90%] max-w-sm backdrop:bg-black/40 open:animate-in open:fade-in"
      >
        <h2 className="text-lg font-semibold mb-2">Sign out?</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to sign out of the admin panel?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={closeConfirm}
            className="px-4 py-2 text-sm rounded-md border hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            Sign out
          </button>
        </div>
      </dialog>
    </header>
  );
}