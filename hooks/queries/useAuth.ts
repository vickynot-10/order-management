// "use client";
// import { useMutation } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";
// import { api } from "@/utils/axios";
// import { toast } from "sonner";
// import { SignupFormValues, LoginFormValues } from "@/types/auth.types";

// export function useSignup() {
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: SignupFormValues) => {
//       const res = await api.post("/sign-up", data);
//       return res.data;
//     },
//     onSuccess: (data) => {
//       if (data.success) {
//         toast.success(data.msg ?? "Account created successfully");
//         router.push("/");
//       }
//     },
//   });
// }

// export function useSignin() {
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async (data: LoginFormValues) => {
//       const res = await api.post("/sign-in", data);
//       return res.data;
//     },
//     onSuccess: (data) => {
//       if (data.success) {
//         toast.success(data.msg ?? "Account created successfully");
//         router.push("/");
//       }
//     },
//   });
// }

// export function useSignout() {
//   const router = useRouter();

//   return useMutation({
//     mutationFn: async () => {
//       const res = await api.post("/sign-out");
//       return res.data;
//     },
//     onSuccess: (data) => {
//       if (data.success) {
//         toast.success(data.msg ?? "Logged out Successfully !");
//         router.push("/sign-in");
//       }
//     },
//   });
// }

// export async function SignOut() {
//   const res = await api.post("/sign-out");
//   return res.data;
// }
