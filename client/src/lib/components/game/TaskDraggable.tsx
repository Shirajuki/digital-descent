import { Draggable } from "@hello-pangea/dnd";

const TaskDraggable = ({
	task,
	checked,
	parent,
	index,
	currentEnergy,
}: any) => {
	const scrollTop = document.getElementById(parent)?.scrollTop || 0;

	return (
		<Draggable key={task.id} draggableId={task.id} index={index}>
			{(provided, snapshot) => (
				<div
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					ref={provided.innerRef}
					key={task.id + "-" + index}
					style={{
						...provided.draggableProps.style,
						// backgroundColor: snapshot.isDragging ? "red" : "#374151",
						top: snapshot.isDragging
							? 160 + (index - Math.floor(scrollTop / 65)) * 65
							: 0,
					}}
					className={`flex bg-slate-700 w-72 px-2 py-2 relative rounded-t-md rounded-l-md ${
						currentEnergy + task.energy > 10 ? "opacity-50" : ""
					}`}
				>
					<input
						className="pointer-events-none"
						type="checkbox"
						checked={checked}
						readOnly
					/>
					<p className="ml-2">
						{task.task}「{task.progress}%」
					</p>
					<div className="flex justify-between absolute text-xs right-0 -bottom-4 w-[90%] bg-slate-600 rounded-b-md px-3 text-right">
						{task.energy > 0 ? <p>{task.energy} energy</p> : <p></p>}
						<p>
							{task.rewards.exp} EXP, {task.rewards.money} Credits
						</p>
					</div>
				</div>
			)}
		</Draggable>
	);
};
export default TaskDraggable;
