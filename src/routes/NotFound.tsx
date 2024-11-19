import { Link } from "react-router-dom";

const NotFound = () => {
	return (
		<div className="flex col center">
			<h2>Oops! Nothing to see here!</h2>
			<p>Sorry, an unexpected error has occurred.</p>
			<p>
				<Link to="/">Go to the home page</Link>
			</p>
		</div>
	);
};

export default NotFound;