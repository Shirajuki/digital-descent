function EffectIcon({
	effect,
	dark = false,
}: {
	effect: string;
	dark?: boolean;
}) {
	if (effect === "lag") {
		return (
			<div
				className={`w-5 h-5 !bg-pink-500 !bg-opacity-40 rounded-sm text-[0.7rem] flex justify-center items-center ${
					dark ? "!bg-pink-900 !bg-opacity-90" : ""
				}`}
				title="Lag (bad)"
			>
				💫
			</div>
		);
	} else if (effect === "nervous") {
		return (
			<div
				className={`w-5 h-5 !bg-pink-500 !bg-opacity-40 rounded-sm text-[0.7rem] flex justify-center items-center ${
					dark ? "!bg-pink-900 !bg-opacity-90" : ""
				}`}
				title="Nervous (bad)"
			>
				💦
			</div>
		);
	} else if (effect === "memoryLeak") {
		return (
			<div
				className={`w-5 h-5 !bg-pink-500 !bg-opacity-40 rounded-sm text-[0.7rem] flex justify-center items-center ${
					dark ? "!bg-pink-900 !bg-opacity-90" : ""
				}`}
				title="Memory Leak (bad)"
			>
				🩸
			</div>
		);
	} else if (effect === "burn") {
		return (
			<div
				className={`w-5 h-5 !bg-pink-500 !bg-opacity-40 rounded-sm text-[0.7rem] flex justify-center items-center ${
					dark ? "!bg-pink-900 !bg-opacity-90" : ""
				}`}
				title="Burn (bad)"
			>
				🔥
			</div>
		);
	} else if (effect === "fire") {
		return (
			<div
				className={`w-5 h-5 !bg-teal-400 !bg-opacity-40 rounded-sm text-[0.7rem] flex justify-center items-center ${
					dark ? "!bg-teal-900 !bg-opacity-90" : ""
				}`}
				title="Hot (good)"
			>
				🌶️
			</div>
		);
	} else if (effect === "attackBoost") {
		return (
			<div
				className={`w-5 h-5 !bg-teal-400 !bg-opacity-40 rounded-sm text-[0.7rem] flex justify-center items-center ${
					dark ? "!bg-teal-900 !bg-opacity-90" : ""
				}`}
				title="Attack boost (good)"
			>
				⚔️
			</div>
		);
	} else if (effect === "defenceBoost") {
		return (
			<div
				className={`w-5 h-5 !bg-teal-400 !bg-opacity-40 rounded-sm text-[0.7rem] flex justify-center items-center ${
					dark ? "!bg-teal-900 !bg-opacity-90" : ""
				}`}
				title="Defence boost (good)"
			>
				🛡️
			</div>
		);
	} else if (effect === "taunt") {
		return (
			<div
				className={`w-5 h-5 !bg-fuchsia-400 !bg-opacity-40 rounded-sm text-[0.7rem] flex justify-center items-center ${
					dark ? "!bg-fuchsia-900 !bg-opacity-90" : ""
				}`}
				title="Taunting (good)"
			>
				💪
			</div>
		);
	} else {
		return <div></div>;
	}
}
export default EffectIcon;
