import { useAtom } from "jotai";
import { engineAtom } from "../../atoms";
import React, { useCallback, useEffect, useReducer, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import autoAnimate from "@formkit/auto-animate";
import DigitalWorldScene from "../../scenes/digitalworld";
import TaskDroppable from "./TaskDroppable";

function useAutoAnimate(options = {}) {
	const [element, setElement] = React.useState<any>(null);
	React.useEffect(() => {
		if (element instanceof HTMLElement) autoAnimate(element, options);
	}, [element]);
	return [setElement];
}

const TaskBoardScreen = () => {
	const [engine, _setEngine] = useAtom(engineAtom);
	const [scaling, setScaling] = useState(1);
	const [infoPopup] = useAutoAnimate();
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		setScaling((document.querySelector("canvas")?.clientWidth ?? 1157) / 1157);
		window.addEventListener("resize", (event) => {
			setScaling(
				(document.querySelector("canvas")?.clientWidth ?? 1157) / 1157
			);
		});
	}, [setScaling]);

	const scene: DigitalWorldScene = engine?.game.scene.getScene(
		engine.game.currentScene
	) as DigitalWorldScene;
	const player = (
		engine?.game.scene.getScene(engine.game.currentScene) as DigitalWorldScene
	)?.player;

	const toggleTaskboard = () => {
		if (scene?.taskboard?.display) {
			window.sfx.closePopup.play();
			scene.taskboard.display = false;
		}
		forceUpdate();
	};

	const currentEnergy =
		engine?.game.data.currentTasks
			.map((t: any) => t.energy)
			.reduce((a: number, b: number) => a + b, 0) || 0;
	if (!player || !scene) return <></>;

	return (
		<div
			className={`absolute top-0 left-0 z-30 w-full h-full [font-family:var(--font-hud)] bg-[rgba(0,0,0,0.7)] rounded-md overflow-hidden [backdrop-filter:blur(3px)] flex justify-center items-center transition-all ${
				scene?.taskboard?.display
					? "opacity-1"
					: "pointer-events-none opacity-0"
			}`}
			style={{ zoom: scaling }}
		>
			{/* Info modal */}
			<div
				className="absolute bg-slate-900 w-[calc(100%-8rem)] h-[calc(100%-3rem)] [user-select:none] flex gap-4 rounded-md p-4"
				ref={infoPopup}
			>
				<div className="bg-slate-800 w-full flex flex-col gap-4 p-4">
					<h1 className="block w-full text-center text-3xl pb-2 [font-family:var(--font-normal)]">
						Taskboard
					</h1>
					<div className="absolute right-4 top-4 ">
						<button
							className={`bg-gray-900 text-xl py-3 px-5 rounded-t-none rounded-r-none text-center transition-all duration-500`}
							onClick={() => toggleTaskboard()}
						>
							×
						</button>
					</div>
					<div className="absolute left-10 top-8">
						<button
							className={`bg-gray-700 text-sm py-[0.70rem] px-5 rounded-md text-center transition-all duration-500`}
						>
							{currentEnergy} / 10 energy
						</button>
					</div>
					<DragDropContext
						onDragEnd={(result) => {
							const { source, destination } = result;
							if (!destination) return;
							if (
								source.droppableId === destination.droppableId &&
								source.index === destination.index
							)
								return;

							const openTasks = engine?.game.data.openTasks;
							const currentTasks = engine?.game.data.currentTasks;
							if (destination?.droppableId === "droppable-1") {
								const currentTask = currentTasks[source.index];
								if (source?.droppableId === "droppable-1") {
									const task = openTasks.splice(source.index, 1);
									openTasks.splice(destination.index, 0, task[0]);
								} else {
									if (currentTask.locked) return;
									const task = currentTasks.splice(source.index, 1);
									openTasks.splice(destination.index, 0, task[0]);
								}
							} else if (destination?.droppableId === "droppable-2") {
								const openTask = openTasks[source.index];
								if (source?.droppableId === "droppable-2") {
									const task = currentTasks.splice(source.index, 1);
									currentTasks.splice(destination.index, 0, task[0]);
								} else {
									if (openTask.energy + currentEnergy > 10) return;
									const task = openTasks.splice(source.index, 1);
									currentTasks.splice(destination.index, 0, task[0]);
								}
							}

							window.channel.emit("task-update", {
								openTasks: openTasks,
								currentTasks: currentTasks,
							});
							scene.observable.notify();
							forceUpdate();
						}}
					>
						<div className="flex gap-3 pl-2 h-full">
							<div className="bg-gray-800 border-slate-900 border-2 h-full w-full rounded-md">
								<h2 className="text-center text-md py-1 bg-zinc-900 mb-3">
									Backlog ({engine?.game.data.openTasks.length})
								</h2>
								<TaskDroppable
									key="droppable-1"
									items={engine?.game.data.openTasks}
									id="droppable-1"
									currentEnergy={currentEnergy}
								/>
							</div>
							<div className="bg-gray-800 border-slate-900 border-2 h-full w-full rounded-md">
								<h2 className="text-center text-md py-1 bg-zinc-900 mb-3">
									Current ({engine?.game.data.currentTasks.length})
								</h2>
								<TaskDroppable
									key="droppable-2"
									items={engine?.game.data.currentTasks}
									id="droppable-2"
								/>
							</div>
							<div className="bg-gray-800 border-slate-900 border-2 h-full w-full rounded-md">
								<h2 className="text-center text-md py-1 bg-zinc-900 mb-3">
									Finished ({engine?.game.data.solvedTasks.length})
								</h2>
								<div className="w-full gap-[1.75rem] min-h-[calc(100%-3rem)] max-h-[calc(3rem)] overflow-x-hidden overflow-y-auto rounded-md flex flex-col items-center">
									{engine?.game.data.solvedTasks.map(
										(currentTask: any, i: number) => (
											<div
												key={`solvedTask-${i}`}
												className="flex bg-slate-700 w-72 px-2 py-2 relative rounded-t-md rounded-l-md"
											>
												<input
													className="pointer-events-none"
													type="checkbox"
													checked
													readOnly
												/>
												<p className="ml-2">{currentTask.task}</p>
												<div className="flex justify-between absolute text-xs right-0 -bottom-4 w-[90%] bg-slate-600 rounded-b-md px-3 text-right">
													{currentTask.energy > 0 ? (
														<p>{currentTask.energy} energy</p>
													) : (
														<p></p>
													)}
													<p>
														{currentTask.rewards.exp} EXP,{" "}
														{currentTask.rewards.money} Credits
													</p>
												</div>
											</div>
										)
									)}
								</div>
							</div>
						</div>
					</DragDropContext>
				</div>
			</div>
		</div>
	);
};
export default TaskBoardScreen;
