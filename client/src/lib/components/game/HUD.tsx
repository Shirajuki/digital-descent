import { useEffect, useReducer } from "react";
import BattleHUD from "./BattleHUD";
import PhaserEngine from "../../engine";

function HUD({ engine }: { engine: PhaserEngine | null }) {
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		if (engine) engine.observable.subscribe(() => forceUpdate());
	}, [engine, forceUpdate]);

	return <>{engine?.game.currentScene === "battle" ? <BattleHUD /> : <></>}</>;
}

export default HUD;
