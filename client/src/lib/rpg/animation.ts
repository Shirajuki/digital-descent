import BattleScene from "../scenes/battle";
import { lerp } from "../utils";

export const spawnTextAtEntity = (
	scene: BattleScene,
	text: string,
	pos: { x: number; y: number },
	target: { x: number; y: number }
) => {
	const textEntity = scene.add.text(pos.x, pos.y, text, {
		fontFamily: "Arial",
		fontSize: "24px",
		color: "#ffffff",
		stroke: "#000000",
		strokeThickness: 6,
	}) as any;
	textEntity.setScale(1);
	textEntity.setAlpha(1);
	textEntity.setDepth(1000);
	textEntity.setOrigin(0.5, 0.5);
	textEntity.target = { x: target.x, y: target.y };
	scene.texts.push(textEntity);
};

export const animateSingleAttack = (scene: BattleScene) => {
	const attacker = scene.battle?.state?.attacker;
	const target = scene.battle?.state?.target;
	let [idle, jump] = ["idle", "jump"];
	if (attacker?.monsterType === "BUG") {
		const texture = attacker.texture.key;
		[idle, jump] = [texture + "Idle", texture + "Idle"];
	}

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
			if (attacker?.animationState === idle) {
				attacker.play(jump);
				attacker.animationState = jump;
			}
			// If attacker is near target
			if (
				Math.abs(attacker.x - target.x) < 70 &&
				Math.abs(attacker.y - target.y) < 70
			) {
				if (!scene.battle.state.finished) {
					// Animate player to stop jumping
					if (attacker?.animationState === jump) {
						attacker.play(idle);
						attacker.animationState = idle;
						scene.currentAttackDelay = scene.attackDelay;
						if (Object.keys(attack.effects).length > 0) {
							scene.currentWaitDelay = scene.waitDelay;
							scene.currentBuffDelay = scene.buffDelay;
						} else {
							scene.currentWaitDelay = 0;
							scene.currentBuffDelay = 0;
						}
					}
					// Do damage to target
					console.log(attack);
					const targetEntities =
						attacker.type === "monster" ? scene.players : scene.monsters;
					for (let i = 0; i < targetEntities.length; i++) {
						const target = targetEntities[i];
						target.battleStats.HP = Math.max(
							target.battleStats.HP - attack.damage[i].damage,
							0
						);
						// Display hit indicator
						const dmg = "" + Math.floor(attack.damage[i].damage * 100) / 100;
						if (dmg !== "0") {
							spawnTextAtEntity(
								scene,
								dmg,
								{ x: target.x, y: target.y + 20 },
								{
									x: target.x + 150 * (attacker.type === "monster" ? 1 : -1),
									y: target.y - 50,
								}
							);
						}
					}
					attacker.battleStats.CHARGE = Math.min(
						attacker.battleStats.CHARGE + 1,
						attacker.battleStats.MAXCHARGE
					);
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
				scene.cameras.cameras[0].shake(100, 0.005);
			}
		} else {
			// Do a quick pause
			scene.currentAttackDelay--;
			if (scene.currentAttackDelay == -1) {
				if (attacker?.animationState === idle) {
					attacker.play(jump);
					attacker.animationState = jump;
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
					if (attacker?.animationState === jump) {
						attacker.play(idle);
						attacker.animationState = idle;
						attacker.flipX = !attacker.flipX;
					}

					// Apply attack effects
					if (attack.effects.attacker) {
						for (let i = 0; i < attack.effects.attacker.length; i++) {
							const effect = attack.effects.attacker[i];
							const buff = effect.split("-");
							if (buff[0] === "single") {
								scene.battle.applyEffect(attacker, buff[1]);
								spawnTextAtEntity(
									scene,
									buff[1],
									{ x: attacker.x, y: attacker.y + 20 + 20 * i },
									{
										x:
											attacker.x + 150 * (attacker.type === "monster" ? -1 : 1),
										y: attacker.y - 50 - 20 * i,
									}
								);
							} else if (buff[0] === "all") {
								const attackerEntities =
									attacker.type === "monster" ? scene.monsters : scene.players;
								for (const entity of attackerEntities) {
									scene.battle.applyEffect(entity, buff[1]);
									spawnTextAtEntity(
										scene,
										buff[1],
										{ x: entity.x, y: entity.y + 20 + 20 * i },
										{
											x: entity.x + 150 * (entity.type === "monster" ? -1 : 1),
											y: entity.y - 50 - 20 * i,
										}
									);
								}
							}
						}
					}
					if (attack.effects.target) {
						for (let i = 0; i < attack.effects.target.length; i++) {
							const effect = attack.effects.target[i];
							const buff = effect.split("-");
							if (buff[0] === "single") {
								scene.battle.applyEffect(target, buff[1]);
								spawnTextAtEntity(
									scene,
									buff[1],
									{ x: target.x, y: target.y + 20 + 20 * i },
									{
										x: target.x + 150 * (target.type === "monster" ? -1 : 1),
										y: target.y - 50,
									}
								);
							} else if (buff[0] === "all") {
								const targetEntities =
									attacker.type === "monster" ? scene.players : scene.monsters;
								for (const entity of targetEntities) {
									scene.battle.applyEffect(entity, buff[1]);
									spawnTextAtEntity(
										scene,
										buff[1],
										{ x: entity.x, y: entity.y + 20 + 20 * i },
										{
											x: entity.x + 150 * (entity.type === "monster" ? -1 : 1),
											y: entity.y - 50,
										}
									);
								}
							}
						}
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
					scene.tweens.getAllTweens().forEach((tween) => {
						tween.stop();
					});
					scene.tweens.killAll();
					const channel = window.channel;
					if (channel)
						channel.emit("battle-turn-finished", {
							turns: scene.battle.turns,
						});

					// If players turn and no target is chosen, pick first monster
					if (!scene.battle.playerTarget) {
						scene.battle.state.target = scene.battle.monsters.find(
							(e: any) => !e.battleStats.dead
						);
						scene.battle.playerTarget = scene.battle.state.target;
					}
				}
			}
		}
	}
};

export const animateStandingAttack = (scene: BattleScene) => {
	const attacker = scene.battle?.state?.attacker;
	const target = scene.battle?.state?.target;
	const camera = scene.centerPoint;
	let [idle, jump] = ["idle", "jump"];
	if (attacker?.monsterType === "BUG") {
		const texture = attacker.texture.key;
		[idle, jump] = [texture + "Idle", texture + "Idle"];
	}

	if (attacker && target && camera) {
		const attack = scene.battle.state.attack;
		if (!scene.battle.state.finished) {
			scene.tweens.add({
				targets: camera,
				x: attacker.x,
				ease: "Back.easeOut",
				duration: 2000,
				delay: 400,
				repeat: -1,
			});
			if (attacker?.animationState === idle) {
				attacker.play(jump);
				attacker.animationState = jump;
			}
			if (Math.abs(camera.x - attacker.x) < 1) {
				if (!scene.battle.state.finished) {
					if (attacker?.animationState === jump) {
						attacker.play(idle);
						attacker.animationState = idle;
						scene.currentAttackDelay = scene.attackDelay;
						if (Object.keys(attack.effects).length > 0) {
							scene.currentWaitDelay = scene.waitDelay;
							scene.currentBuffDelay = scene.buffDelay;
						} else {
							scene.currentWaitDelay = 0;
							scene.currentBuffDelay = 0;
						}
					}

					// Apply attack effects
					if (attack.effects.attacker) {
						for (let i = 0; i < attack.effects.attacker.length; i++) {
							const effect = attack.effects.attacker[i];
							const buff = effect.split("-");
							if (buff[0] === "single") {
								scene.battle.applyEffect(attacker, buff[1]);
								spawnTextAtEntity(
									scene,
									buff[1],
									{ x: attacker.x, y: attacker.y + 20 + 20 * i },
									{
										x:
											attacker.x + 150 * (attacker.type === "monster" ? -1 : 1),
										y: attacker.y - 50 - 20 * i,
									}
								);
							} else if (buff[0] === "all") {
								const attackerEntities =
									attacker.type === "monster" ? scene.monsters : scene.players;
								for (const entity of attackerEntities) {
									scene.battle.applyEffect(entity, buff[1]);
									spawnTextAtEntity(
										scene,
										buff[1],
										{ x: entity.x, y: entity.y + 20 + 20 * i },
										{
											x: entity.x + 150 * (entity.type === "monster" ? -1 : 1),
											y: entity.y - 50 - 20 * i,
										}
									);
								}
							}
						}
					}
					if (attack.effects.target) {
						for (let i = 0; i < attack.effects.target.length; i++) {
							const effect = attack.effects.target[i];
							const buff = effect.split("-");
							if (buff[0] === "single") {
								scene.battle.applyEffect(target, buff[1]);
								spawnTextAtEntity(
									scene,
									buff[1],
									{ x: target.x, y: target.y + 20 + 20 * i },
									{
										x: target.x + 150 * (target.type === "monster" ? -1 : 1),
										y: target.y - 50,
									}
								);
							} else if (buff[0] === "all") {
								const targetEntities =
									attacker.type === "monster" ? scene.players : scene.monsters;
								for (const entity of targetEntities) {
									setTimeout(() => {
										scene.battle.applyEffect(entity, buff[1]);
										spawnTextAtEntity(
											scene,
											buff[1],
											{ x: entity.x, y: entity.y + 20 + 20 * i },
											{
												x:
													entity.x + 150 * (entity.type === "monster" ? -1 : 1),
												y: entity.y - 50,
											}
										);
									}, 1200);
								}
							}
						}
					}
				}
				scene.battle.state.finished = true;
			}
		} else {
			scene.currentBuffDelay--;
			if (scene.currentBuffDelay < 0 && scene.currentAttackDelay > 0) {
				scene.tweens.add({
					targets: camera,
					x: 0,
					ease: "Back.easeOut",
					duration: 2000,
					delay: 500,
					repeat: -1,
				});
			}
			if (camera.x < 1) {
				camera.x = 0;
				scene.currentAttackDelay--;
				if (scene.currentAttackDelay == -1) {
					// Display hitIndicator
					const targetEntities =
						attacker.type === "monster" ? scene.players : scene.monsters;
					for (let i = 0; i < targetEntities.length; i++) {
						const target = targetEntities[i];
						target.battleStats.HP = Math.max(
							target.battleStats.HP -
								scene.battle.state.attack.damage[i].damage,
							0
						);
						const dmg =
							"" +
							Math.floor(scene.battle.state.attack.damage[i].damage * 100) /
								100;
						if (dmg !== "0") {
							spawnTextAtEntity(
								scene,
								dmg,
								{ x: target.x, y: target.y + 20 },
								{
									x: target.x + 150 * (attacker.type === "monster" ? 1 : -1),
									y: target.y - 50,
								}
							);
						}
					}
				} else if (scene.currentAttackDelay < 0) {
					scene.currentWaitDelay--;
				}
				if (scene.currentWaitDelay < 0 && scene.battle.state.finished) {
					camera.x = 0;
					// scene.cameras.main.x = 12;
					scene.battle.state.running = false;
					scene.battle.state.finished = false;
					scene.battle.state.attacker = null;
					scene.battle.updateActionQueue();
					scene.battle.updateTurn();
					scene.tweens.getAllTweens().forEach((tween) => {
						tween.stop();
					});
					scene.tweens.killAll();
					scene.observable.notify();
					// Turn finished
					const channel = window.channel;
					if (channel)
						channel.emit("battle-turn-finished", {
							turns: scene.battle.turns,
						});

					// If players turn and no target is chosen, pick first monster
					if (!scene.battle.playerTarget) {
						scene.battle.state.target = scene.battle.monsters.find(
							(e: any) => !e.battleStats.dead
						);
						scene.battle.playerTarget = scene.battle.state.target;
					}
				}
			}
		}
	}
};
