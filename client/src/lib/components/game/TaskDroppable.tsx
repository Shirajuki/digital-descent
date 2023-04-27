import { useDroppable } from "@dnd-kit/core";
import TaskDraggable from "./TaskDraggable";
import { SortableContext } from "@dnd-kit/sortable";

const TaskDroppable = ({ items, id }: any) => {
	const { setNodeRef } = useDroppable({
		id: id,
	});

	return (
		<SortableContext items={items}>
			<div
				ref={setNodeRef}
				id={id}
				className="w-full gap-[1.75rem] min-h-[calc(100%-3rem)] max-h-[calc(3rem)] overflow-x-hidden overflow-y-auto rounded-md flex flex-col items-center"
			>
				{items?.map((currentTask: any, i: number) => (
					<TaskDraggable
						currentTask={currentTask}
						key={`${id}-${i}`}
						parent={id}
						index={i}
					/>
				))}
			</div>
		</SortableContext>
	);
};
export default TaskDroppable;
