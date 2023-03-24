import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Game from "./Game";
import "./index.scss";

const router = createBrowserRouter([
	{
		path: "/",
		element: <div>main menu</div>,
	},
	{
		path: "lobby",
		element: <div>lobby</div>,
	},
	{
		path: "game",
		element: <Game />,
	},
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>
);
