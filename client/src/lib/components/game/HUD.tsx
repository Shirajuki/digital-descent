import { useEffect, useReducer } from "react";
import BattleHUD from "./BattleHUD";
import PhaserEngine from "../../engine";
import EffectHUD from "./EffectHUD";
import WinScreen from "./WinScreen";
import DialogueScreen from "./DialogueScreen";
import TaskBoardScreen from "./TaskBoardScreen";
import ShopScreen from "./ShopScreen";
import PortalScreen from "./PortalScreen";
import RoleScreen from "./RoleScreen";
import DigitalWorldHUD from "./DigitalWorldHUD";
import ExplorationHUD from "./ExplorationHUD";

function HUD({ engine }: { engine: PhaserEngine | null }) {
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		if (engine) engine.observable.subscribe(() => forceUpdate(), "battle");
	}, [engine, forceUpdate]);

	return (
		<>
			{engine?.game.currentScene === "battle" ? <EffectHUD /> : <></>}
			{engine?.game.currentScene === "battle" ? <BattleHUD /> : <></>}
			{engine?.game.currentScene === "battle" ? <WinScreen /> : <></>}
			{engine?.game.currentScene === "exploration" ? <ExplorationHUD /> : <></>}
			{engine?.game.currentScene === "office" ||
			engine?.game.currentScene === "home" ? (
				<RoleScreen />
			) : (
				<></>
			)}
			{engine?.game.currentScene === "digitalworld" ||
			engine?.game.currentScene === "exploration" ? (
				<DigitalWorldHUD />
			) : (
				<></>
			)}
			{engine?.game.currentScene === "digitalworld" ||
			engine?.game.currentScene === "home" ? (
				<>
					<TaskBoardScreen />
					<ShopScreen />
					<PortalScreen />
				</>
			) : (
				<></>
			)}
			<DialogueScreen />
		</>
	);
}

export default HUD;
