import { RouterProvider } from "react-router-dom";

import { Query } from "@/lib/query";

import { router } from "./lib/router";

const App = () => {
	return (
		<Query>
			<RouterProvider
				router={router}
				fallbackElement={<p>Initial Load...</p>}
			/>
		</Query>
	);
};
export default App;
// App.tsx
