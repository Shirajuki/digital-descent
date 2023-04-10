export const inputInitPlayerMovement = (scene: any) => {
	// Keyboard input setup
	scene.input.keyboard.on("keydown", (event: any) => {
		if (document?.activeElement?.nodeName === "INPUT") return;
		const { key } = event;
		if (key === "ArrowLeft" || key === "a") {
			scene.player.movement.left = true;
			scene.player.facing = 0;
		} else if (key === "ArrowUp" || key === "w") {
			scene.player.movement.up = true;
		} else if (key === "ArrowRight" || key === "d") {
			scene.player.movement.right = true;
			scene.player.facing = 1;
		} else if (key === "ArrowDown" || key === "s") {
			scene.player.movement.down = true;
		}
	});
	scene.input.keyboard.on("keyup", (event: any) => {
		const { key } = event;
		if (key === "ArrowLeft" || key === "a") {
			scene.player.movement.left = false;
		} else if (key === "ArrowUp" || key === "w") {
			scene.player.movement.up = false;
		} else if (key === "ArrowRight" || key === "d") {
			scene.player.movement.right = false;
		} else if (key === "ArrowDown" || key === "s") {
			scene.player.movement.down = false;
		}
	});
};
