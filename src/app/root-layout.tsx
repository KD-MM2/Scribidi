import { ConfigProvider, theme } from "antd";

import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";

export const RootLayout: React.FC = () => {
	const { defaultAlgorithm, darkAlgorithm } = theme;
	const [isDarkMode, setIsDarkMode] = useState(false);

	useEffect(() => {
		const darkModeMediaQuery = window.matchMedia(
			"(prefers-color-scheme: dark)"
		);
		setIsDarkMode(darkModeMediaQuery.matches);
		const handleChange = (e: MediaQueryListEvent) => {
			setIsDarkMode(e.matches);
		};
		darkModeMediaQuery.addEventListener("change", handleChange);
		return () => {
			darkModeMediaQuery.removeEventListener("change", handleChange);
		};
	}, []);

	return (
		<>
			<ConfigProvider
				theme={{
					algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
				}}
			>
				{/* <AuthStatus /> */}
				<Outlet />
			</ConfigProvider>
		</>
	);
};

export const AppRootErrorBoundary = () => {
	return <div>Something went wrong!</div>;
};

// function AuthStatus() {
// 	const { user } = useRouteLoaderData("root") as { user: any };
// 	const fetcher = useFetcher();
// 	console.log("AuthStatus: user", user);
// 	if (!user) {
// 		return <p>You are not logged in.</p>;
// 	}

// 	const isLoggingOut = fetcher.formData != null;

// 	return (
// 		<div>
// 			<p>Welcome {JSON.stringify(user)}!</p>
// 			<fetcher.Form method="post" action="/auth/logout">
// 				<button type="submit" disabled={isLoggingOut}>
// 					{isLoggingOut ? "Signing out..." : "Sign out"}
// 				</button>
// 			</fetcher.Form>
// 		</div>
// 	);
// }
