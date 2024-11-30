// router.tsx
import localForage from "localforage";

import { redirect, createBrowserRouter } from "react-router-dom";
import type { LoaderFunctionArgs } from "react-router-dom";

import { login, logout, me, register } from "@/api/auth";
import { AppRootErrorBoundary } from "@/app/root-layout";

export const authProvider = {
  isAuthenticated: false,
  user: null as any,
  token: null as string | null,

  async getUser() {
    const token = await localForage.getItem("scribidi_token");
    console.log("getUser.token", token);
    if (!token) {
      this.isAuthenticated = false;
      this.user = null;
      this.token = null;
      return null;
    }

    try {
      const response = await me();
      this.isAuthenticated = true;
      this.user = response;
      return this.user;
    } catch (error) {
      this.isAuthenticated = false;
      this.user = null;
      this.token = null;
      await localForage.removeItem("scribidi_token");
      return null;
    }
  },

  async signin(email: string, password: string) {
    try {
      const response = await login({ email, password });
      if (!response) {
        return response;
      }
      await localForage.setItem("scribidi_token", response.token);
      this.isAuthenticated = true;
      this.user = response.user;
      this.token = response.token;
      return response.user;
    } catch (error) {
      return false;
    }
  },

  async signout() {
    try {
      await logout();
      await localForage.removeItem("scribidi_token");
      this.isAuthenticated = false;
      this.user = null;
      this.token = null;
      console.log("Signing out");
      window.location.href = "/auth/login";
      return true;
    } catch (error) {
      console.error("Error signing out", error);
      return false;
    }
  },

  async signup(name: string, email: string, password: string) {
    try {
      const response = await register({ name, email, password });
      if (!response) {
        return response;
      }
      await localForage.setItem("scribidi_token", response.token);
      this.isAuthenticated = true;
      this.user = response.user;
      this.token = response.token;
      return response.user;
    } catch (error) {
      return false;
    }
  },
};
const v7_future = {
  future: {
    v7_relativeSplatPath: true,
    v7_startTransition: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
};

export const router = createBrowserRouter(
  [
    {
      id: "root",
      path: "/",
      async loader() {
        return { user: await authProvider.getUser() };
      },
      lazy: async () => {
        const { RootLayout } = await import("@/app/root-layout");
        return { Component: RootLayout };
      },
      children: [
        {
          index: true,
          lazy: async () => {
            const { Landing } = await import("@/app/auth/landing");
            return { Component: Landing };
          },
        },
        {
          path: "/auth/login",
          lazy: async () => {
            const { Login } = await import("@/app/auth/login");
            return { Component: Login };
          },
          loader: publicLoader,
        },
        {
          path: "/auth/register",
          lazy: async () => {
            const { Register } = await import("@/app/auth/register");
            return { Component: Register };
          },
          loader: publicLoader,
        },
        {
          path: "/app",
          lazy: async () => {
            const { Transcripts } = await import("@/app/app/transcripts");
            return { Component: Transcripts };
          },
          loader: protectedLoader,
        },
        {
          path: "/app/setup",
          lazy: async () => {
            const { Setup } = await import("@/app/app/setup");
            return { Component: Setup };
          },
          loader: protectedLoader,
        },
        {
          path: "/app/upload",
          lazy: async () => {
            const { Upload } = await import("@/app/app/upload");
            return { Component: Upload };
          },
          loader: protectedLoader,
        },
        {
          path: "/app/templates",
          lazy: async () => {
            const { Templates } = await import("@/app/app/templates");
            return { Component: Templates };
          },
          loader: protectedLoader,
        },
        {
          path: "/app/settings",
          lazy: async () => {
            const { Settings } = await import("@/app/app/settings");
            return { Component: Settings };
          },
          loader: protectedLoader,
        },
      ],
    },
    // {
    // 	path: "/auth/logout",
    // 	loader: protectedLoader,
    // 	action: async () => {
    // 		await authProvider.signout();
    // 		window.location.href = "/auth/login";
    // 	},
    // },
    {
      path: "*",
      lazy: async () => {
        const { NotFound } = await import("@/app/not-found");
        return {
          Component: NotFound,
        };
      },
      ErrorBoundary: AppRootErrorBoundary,
    },
  ],
  v7_future
);

async function publicLoader() {
  await authProvider.getUser(); // Ensure getUser is called to update the state
  if (authProvider.isAuthenticated) {
    return redirect("/");
  }
  return null;
}

async function protectedLoader({ request }: LoaderFunctionArgs) {
  const user = await authProvider.getUser();
  // if (!authProvider.user) {
  console.log("protectedLoader", authProvider, user);
  if (!authProvider.isAuthenticated) {
    const params = new URLSearchParams();
    params.set("from", new URL(request.url).pathname);
    return redirect("/auth/login?" + params.toString());
  }
  return null;
}
