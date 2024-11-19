import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import "@/index.css";
import Landing from "@/pages/Landing";
import NotFound from "@/routes/NotFound";
import Root from "@/routes/Root";

const routes = [
	{
		path: "/",
		element: <Root />,
		errorElement: <NotFound />,
		children: [
			{
				path: "/",
				element: <Landing />,
			},
		],
	},
];

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

const router = createBrowserRouter(routes, v7_future);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>
);
