export const animateAttack = (scene: any) => {
	const attacker = scene.battle?.state?.attacker;
	const target = scene.battle?.state?.target;
	if (attacker && target) {
		if (!scene.battle.state.finished) {
			scene.tweens.add({
				targets: attacker,
				x: target.x + 50 * (attacker.x > target.x ? 1 : -1),
				y: target.y + 1,
				ease: "Back.easeOut",
				duration: 2000,
				delay: 400,
				repeat: -1,
			});
			if (attacker?.animationState === "idle") {
				attacker.play("jump");
				attacker.animationState = "jump";
			}
			if (
				Math.abs(attacker.x - target.x) < 70 &&
				Math.abs(attacker.y - target.y) < 70
			) {
				if (!scene.battle.state.finished) {
					scene.currentAttackDelay = scene.attackDelay;
					// Attacked
					if (attacker?.animationState === "jump") {
						attacker.play("idle");
						attacker.animationState = "idle";
					}
					console.log(scene.battle.state.damage);
					target.battleStats.HP = Math.max(
						target.battleStats.HP - scene.battle.state.damage.damage,
						0
					);
					attacker.battleStats.CHARGE = Math.min(
						attacker.battleStats.CHARGE + 1,
						attacker.battleStats.MAXCHARGE
					);
					// Display hitIndicator
					const dmg =
						"" + Math.floor(scene.battle.state.damage.damage * 100) / 100;
					scene.text.setText(dmg);
					scene.text.x = target.x;
					scene.text.y = target.y + 20;
					scene.text.setScale(1);
					scene.text.setAlpha(1);
					scene.text.target = {
						x: target.x + 150 * (attacker.type === "monster" ? 1 : -1),
						y: target.y - 50,
					};
				}
				scene.battle.state.finished = true;
				scene.tweens.add({
					targets: target,
					alpha: 0,
					ease: "Cubic.easeOut",
					delay: 140,
					duration: 100,
					repeat: 1,
					yoyo: true,
				});
			}
		} else {
			scene.currentAttackDelay--;
			if (scene.currentAttackDelay < 0) {
				scene.tweens.add({
					targets: attacker,
					x: scene.battle.state.initialPosition.x,
					y: scene.battle.state.initialPosition.y,
					ease: "Back.easeOut",
					duration: 2000,
					delay: 500,
					repeat: -1,
				});
				if (attacker?.animationState === "idle") {
					attacker.play("jump");
					attacker.animationState = "jump";
					attacker.flipX = !attacker.flipX;
				}
			}
			if (
				Math.abs(attacker.x - scene.battle.state.initialPosition.x) < 10 &&
				Math.abs(attacker.y - scene.battle.state.initialPosition.y) < 10
			) {
				// Reset attacker movement
				if (attacker?.animationState === "jump") {
					attacker.play("idle");
					attacker.animationState = "idle";
					attacker.flipX = !attacker.flipX;
				}
				scene.battle.state.running = false;
				scene.battle.state.finished = false;
				scene.battle.state.attacker = null;
				scene.battle.updateActionQueue();
				// Turn finished
				const channel = window.channel;
				if (channel)
					channel.emit("battle-turn-finished", {
						turns: scene.battle.turns,
					});
				scene.observable.notify();
			}
		}
	}
};
