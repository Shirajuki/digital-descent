export const animateSingleAttack = (scene: any) => {
	const attacker = scene.battle?.state?.attacker;
	const target = scene.battle?.state?.target;
	if (attacker && target) {
		const attack = scene.battle.state.attack;
		if (!scene.battle.state.finished) {
			// Move attacker to target
			scene.tweens.add({
				targets: attacker,
				x: target.x + 50 * (attacker.x > target.x ? 1 : -1),
				y: target.y + 1,
				ease: "Back.easeOut",
				duration: 2000,
				delay: 400,
				repeat: -1,
			});
			// Animate player to start jumping
			if (attacker?.animationState === "idle") {
				attacker.play("jump");
				attacker.animationState = "jump";
			}
			// If attacker is near target
			if (
				Math.abs(attacker.x - target.x) < 70 &&
				Math.abs(attacker.y - target.y) < 70
			) {
				if (!scene.battle.state.finished) {
					scene.currentAttackDelay = scene.attackDelay;
					if (Object.keys(attack.effects).length > 0) {
						scene.currentWaitDelay = scene.waitDelay;
						scene.currentBuffDelay = scene.buffDelay;
					} else {
						scene.currentWaitDelay = 0;
						scene.currentBuffDelay = 0;
					}
					// Animate player to stop jumping
					if (attacker?.animationState === "jump") {
						attacker.play("idle");
						attacker.animationState = "idle";
					}
					// Do damage to target
					console.log(attack);
					target.battleStats.HP = Math.max(
						target.battleStats.HP - attack.damage.damage,
						0
					);
					attacker.battleStats.CHARGE = Math.min(
						attacker.battleStats.CHARGE + 1,
						attacker.battleStats.MAXCHARGE
					);
					// Display hit indicator
					const dmg = "" + Math.floor(attack.damage.damage * 100) / 100;
					const text = scene.add.text(target.x, target.y + 20, dmg, {
						fontFamily: "Arial",
						fontSize: "32px",
						color: "#ffffff",
						stroke: "#000000",
						strokeThickness: 6,
					});
					text.setScale(1);
					text.setAlpha(1);
					text.setDepth(1000);
					text.setOrigin(0.5, 0.5);
					text.target = {
						x: target.x + 150 * (attacker.type === "monster" ? 1 : -1),
						y: target.y - 50,
					};
					scene.texts.push(text);
				}
				// Update attack state to finished
				scene.battle.state.finished = true;
				// Hit flicker on target
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
			// Do a quick pause
			scene.currentAttackDelay--;
			if (scene.currentAttackDelay == -1) {
				if (attacker?.animationState === "idle") {
					attacker.play("jump");
					attacker.animationState = "jump";
					attacker.flipX = !attacker.flipX;
				}
			} else if (scene.currentAttackDelay < 0) {
				scene.tweens.add({
					targets: attacker,
					x: scene.battle.state.initialPosition.x,
					y: scene.battle.state.initialPosition.y,
					ease: "Back.easeOut",
					duration: 2000,
					delay: 500,
					repeat: -1,
				});
			}
			if (
				Math.abs(attacker.x - scene.battle.state.initialPosition.x) < 10 &&
				Math.abs(attacker.y - scene.battle.state.initialPosition.y) < 10
			) {
				// Do a quick pause
				scene.currentBuffDelay--;
				if (scene.currentBuffDelay == -1) {
					// Reset attacker movement
					if (attacker?.animationState === "jump") {
						attacker.play("idle");
						attacker.animationState = "idle";
						attacker.flipX = !attacker.flipX;
					}

					// Apply attack effects
					if (attack.effects.attacker) {
						for (let i = 0; i < attack.effects.attacker.length; i++) {
							const effect = attack.effects.attacker[i];
							const buff = effect.split("-");
							if (buff[0] === "self") {
							} else if (buff[0] === "single") {
							} else if (buff[0] === "all") {
								const text = scene.add.text(
									attacker.x,
									attacker.y + 20 + 20 * i,
									buff[1],
									{
										fontFamily: "Arial",
										fontSize: "24px",
										color: "#ffffff",
										stroke: "#000000",
										strokeThickness: 6,
									}
								);
								text.setScale(1);
								text.setAlpha(1);
								text.setDepth(1000);
								text.setOrigin(0.5, 0.5);
								text.target = {
									x: attacker.x + 150 * (attacker.type === "monster" ? -1 : 1),
									y: attacker.y - 50,
								};
								scene.texts.push(text);
							}
						}
					}
					if (attack.effects.target) {
					}
				} else if (scene.currentBuffDelay < 0) {
					scene.currentWaitDelay--;
				}
				// Turn finished
				if (scene.currentWaitDelay < 0 && scene.battle.state.finished) {
					scene.battle.state.running = false;
					scene.battle.state.finished = false;
					scene.battle.state.attacker = null;
					scene.battle.updateActionQueue();
					scene.battle.updateTurn();
					scene.observable.notify();
					const channel = window.channel;
					if (channel)
						channel.emit("battle-turn-finished", {
							turns: scene.battle.turns,
						});
				}
			}
		}
	}
};

export const animateStandingAttack = (scene: any) => {
	const attacker = scene.battle?.state?.attacker;
	const target = scene.battle?.state?.target;
	const camera = scene.centerPoint;
	if (attacker && target && camera) {
		if (!scene.battle.state.finished) {
			scene.tweens.add({
				targets: camera,
				x: attacker.x,
				ease: "Back.easeOut",
				duration: 2000,
				delay: 400,
				repeat: -1,
			});
			if (attacker?.animationState === "idle") {
				attacker.play("jump");
				attacker.animationState = "jump";
			}
			if (Math.abs(camera.x - attacker.x) < 1) {
				if (!scene.battle.state.finished) {
					if (attacker?.animationState === "jump") {
						attacker.play("idle");
						attacker.animationState = "idle";
					}
					scene.currentAttackDelay = scene.attackDelay;
					// Display hitIndicator
					const dmg =
						"" +
						Math.floor(scene.battle.state.attack.damage.damage * 100) / 100;
					const text = scene.add.text(target.x, target.y + 20, dmg, {
						fontFamily: "Arial",
						fontSize: "32px",
						color: "#ffffff",
						stroke: "#000000",
						strokeThickness: 6,
					});
					text.setScale(1);
					text.setAlpha(1);
					text.setDepth(1000);
					text.setOrigin(0.5, 0.5);
					text.target = {
						x: target.x + 150 * (attacker.type === "monster" ? 1 : -1),
						y: target.y - 50,
					};
					scene.texts.push(text);
				}
				scene.battle.state.finished = true;
			}
		} else {
			scene.currentAttackDelay--;
			if (scene.currentAttackDelay < 0) {
				scene.tweens.add({
					targets: camera,
					x: 0,
					ease: "Back.easeOut",
					duration: 2000,
					delay: 500,
					repeat: -1,
				});
			}
			if (Math.abs(camera.x) < 1) {
				camera.x = 0;
				scene.battle.state.running = false;
				scene.battle.state.finished = false;
				scene.battle.state.attacker = null;
				scene.battle.updateActionQueue();
				scene.battle.updateTurn();
				scene.observable.notify();
				// Turn finished
				const channel = window.channel;
				if (channel)
					channel.emit("battle-turn-finished", {
						turns: scene.battle.turns,
					});
			}
		}
	}
};
