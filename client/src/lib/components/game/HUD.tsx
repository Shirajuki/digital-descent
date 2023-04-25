import { useEffect, useReducer } from "react";
import BattleHUD from "./BattleHUD";
import PhaserEngine from "../../engine";
import EffectHUD from "./EffectHUD";
import WinScreen from "./WinScreen";
import DialogueScreen from "./DialogueScreen";
import TaskBoardScreen from "./TaskBoardScreen";
import ShopScreen from "./ShopScreen";
import PortalScreen from "./PortalScreen";

function HUD({ engine }: { engine: PhaserEngine | null }) {
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		if (engine) engine.observable.subscribe(() => forceUpdate(), "battle");
	}, [engine, forceUpdate]);

	// console.log(engine?.game.currentScene);

	return (
		<>
			{engine?.game.currentScene === "battle" ? <EffectHUD /> : <></>}
			{engine?.game.currentScene === "battle" ? <BattleHUD /> : <></>}
			{engine?.game.currentScene === "battle" ? <WinScreen /> : <></>}
			{/* {engine?.game.currentScene === "exploration" ? <ExplorationHUD /> : <></>} */}
			{/* {engine?.game.currentScene === "digitalworld" ? <DigitalWorldHUD /> : <></>} */}
			{engine?.game.currentScene === "digitalworld" ? (
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
