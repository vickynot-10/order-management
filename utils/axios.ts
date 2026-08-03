import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL:  "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => {
    if (
      response.data?.msg &&
      response.status === 202 &&
      response.data.info === true
    ) {
      toast.info(response.data.msg);
    }

    return response;
  },
  async (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Something went wrong";

    toast.error(message);

    // if (error.response?.status === 401) {
    //   try {
    //     await SignOut();
    //     window.location.href = "/sign-in";
    //   } catch (e) {
    //     window.location.href = "/sign-in";
    //   }
    // }

    return Promise.reject(error);
  },
);
