import { useEffect, useReducer } from "react";
import BattleHUD from "./BattleHUD";
import PhaserEngine from "../../engine";
import EffectHUD from "./EffectHUD";
import WinScreen from "./WinScreen";

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
		</>
	);
}

export default HUD;
