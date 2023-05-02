import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const TaskDraggable = ({ currentTask, checked, parent, index }: any) => {
	const { attributes, listeners, setNodeRef, transform, isDragging } =
		useDraggable({
			id: JSON.stringify(currentTask),
			data: {
				parent: parent,
				...currentTask,
			},
		});

	const scrollTop = document.getElementById(parent)?.scrollTop || 0;

	return (
		<div
			{...attributes}
			{...listeners}
			ref={setNodeRef}
			style={{
				transform: CSS.Translate.toString(transform),
				position: isDragging ? "absolute" : "relative",
				top: isDragging ? `${index * 60 + 150}px` : "0px",
				zIndex: isDragging ? 100 : 1,
			}}
			className="flex bg-slate-700 w-72 px-2 py-2 relative rounded-t-md rounded-l-md"
		>
			<input
				className="pointer-events-none"
				type="checkbox"
				checked={checked}
				readOnly
			/>
			<p className="ml-2">
				{currentTask.task}「{currentTask.progress}%」
			</p>
			<div className="flex justify-between absolute text-xs right-0 -bottom-4 w-[90%] bg-slate-600 rounded-b-md px-3 text-right">
				{currentTask.energy > 0 ? <p>{currentTask.energy} energy</p> : <p></p>}
				<p>
					{currentTask.rewards.exp} EXP, {currentTask.rewards.money} Credits
				</p>
			</div>
		</div>
	);
};
export default TaskDraggable;
