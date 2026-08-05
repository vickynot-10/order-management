"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  LogIn,
  LogOut,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSignUp, useLogin, useLogout } from "@/hooks/queries/useClientAuth";
import { useMe } from "@/hooks/queries/useMe";

const signInSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z
  .object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

function SignInForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });

  const { mutate, isPending: isSubmitting } = useLogin();

  function onSubmit(values: SignInValues) {
    mutate(values, {
      onSuccess: (data) => {
        if (data.success) onSuccess();
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signin-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signin-email"
            type="email"
            placeholder="you@example.com"
            className="pl-9"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signin-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signin-password"
            type="password"
            placeholder="••••••••"
            className="pl-9"
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <LogIn className="h-4 w-4" />
        )}
        Sign In
      </Button>
    </form>
  );
}

function SignUpForm({ onSuccess }: { onSuccess: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) });

  const { mutate, isPending: isSubmitting } = useSignUp();

  function onSubmit(values: SignUpValues) {
    mutate(values, {
      onSuccess: (data) => {
        if (data.success) onSuccess();
      },
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-name">Name</Label>
        <div className="relative">
          <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signup-name"
            placeholder="John Doe"
            className="pl-9"
            {...register("name")}
          />
        </div>
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signup-email"
            type="email"
            placeholder="you@example.com"
            className="pl-9"
            {...register("email")}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signup-password"
            type="password"
            placeholder="••••••••"
            className="pl-9"
            {...register("password")}
          />
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-confirm">Confirm Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="signup-confirm"
            type="password"
            placeholder="••••••••"
            className="pl-9"
            {...register("confirmPassword")}
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserIcon className="h-4 w-4" />
        )}
        Create Account
      </Button>
    </form>
  );
}

export default function AuthModal() {
  const [open, setOpen] = useState(false);
  const { data: me } = useMe();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  if (me) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{me.name}</span>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full text-red-600 hover:text-red-700"
          onClick={() => logout()}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4" />
          )}
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger>
          <DialogTrigger>
            <Button variant="outline" size="icon" className="rounded-full">
              <UserIcon className="h-4 w-4" />
              <span className="sr-only">Sign In / Sign Up</span>
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>Sign In / Sign Up</TooltipContent>
      </Tooltip>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="items-center text-center">
          <DialogTitle>Welcome</DialogTitle>
          <DialogDescription>
            Sign in to your account or create a new one.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="signin"
          className="w-full flex flex-col items-center"
        >
          <TabsList className="grid grid-cols-2 w-full max-w-[220px]">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="w-full pt-6">
            <SignInForm onSuccess={() => setOpen(false)} />
          </TabsContent>
          <TabsContent value="signup" className="w-full pt-6">
            <SignUpForm onSuccess={() => setOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
