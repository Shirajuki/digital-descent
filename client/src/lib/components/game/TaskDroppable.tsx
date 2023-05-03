import TaskDraggable from "./TaskDraggable";
import { Droppable } from "@hello-pangea/dnd";

const TaskDroppable = ({ items, id, currentEnergy = 0 }: any) => {
	return (
		<Droppable droppableId={id}>
			{(provided) => (
				<div
					id={id}
					ref={provided.innerRef}
					{...provided.droppableProps}
					className="w-full gap-[1.75rem] min-h-[calc(100%-3rem)] max-h-[calc(3rem)] overflow-x-hidden overflow-y-auto rounded-md flex flex-col items-center"
				>
					{items?.map((task: any, i: number) => (
						<TaskDraggable
							task={task}
							key={`${id}-${i}`}
							parent={id}
							index={i}
							currentEnergy={currentEnergy}
						/>
					))}
					{provided.placeholder}
				</div>
			)}
		</Droppable>
	);
};
export default TaskDroppable;
