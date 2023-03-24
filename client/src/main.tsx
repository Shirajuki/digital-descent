import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Game from "./Game";
import Lobby from "./Lobby";
import "./index.scss";

const router = createBrowserRouter([
	{
		path: "/",
		element: <div>main menu</div>,
	},
	{
		path: "lobby",
		element: <Lobby />,
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
