'use client'
import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Calendar, Ellipsis, Filter, MenuIcon } from "lucide-react";
import { useLanguage, interpolate } from "@/lib/i18n/LanguageContext";

// Types
type Task = {
  id: string;
  title: string;
  team: string;
  days: number;
  comments: number;
  attachments: number;
};

type Column = {
  id: string;
  title: string;
  tasks: Task[];
};

type BoardData = {
  columns: Record<string, Column>;
};

// There is no client-facing task/board API yet, so the board starts empty.
// The three-column scaffold and drag-and-drop remain so the feature is ready
// to bind to real tasks once an endpoint exists — no seeded placeholder cards.
const initialData: BoardData = {
  columns: {
    todo: {
      id: "todo",
      title: "To Do task",
      tasks: [],
    },
    progress: {
      id: "progress",
      title: "In Progress",
      tasks: [],
    },
    done: {
      id: "done",
      title: "Completed",
      tasks: [],
    },
  },
};

export default function OrganisationBoard() {
  const { t } = useLanguage();
  const [data, setData] = React.useState<BoardData>(initialData);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = data.columns[source.droppableId];
    const destCol = data.columns[destination.droppableId];
    const sourceTasks = [...sourceCol.tasks];
    const destTasks = [...destCol.tasks];

    const [movedTask] = sourceTasks.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceTasks.splice(destination.index, 0, movedTask);
      setData({
        columns: {
          ...data.columns,
          [sourceCol.id]: { ...sourceCol, tasks: sourceTasks },
        },
      });
    } else {
      destTasks.splice(destination.index, 0, movedTask);
      setData({
        columns: {
          ...data.columns,
          [sourceCol.id]: { ...sourceCol, tasks: sourceTasks },
          [destCol.id]: { ...destCol, tasks: destTasks },
        },
      });
    }
  };

  return (
    <>
    <div className="min-h-screen p-6 text-foreground">
      <h1 className="text-xl font-semibold text-primary my-6">{interpolate(t.dashboard.kanban.title)}</h1>

      <div className="bg-card rounded-xl p-6 ">
        <div className="flex justify-between">
          <div>
            <h2 className="text-lg font-medium mb-1 text-foreground">{interpolate(t.dashboard.kanban.overview)}</h2>
            <p className="text-sm text-foreground opacity-70 mb-6">{interpolate(t.dashboard.kanban.desc)}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-background font-bold">+</button>
          </div>
        </div>
        {/* Search Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6 lg:justify-between">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex items-center bg-secondary border border-lemon rounded-lg px-4 py-2 w-full lg:w-auto">
              <span className="mr-2 text-foreground opacity-70">🔍</span>
              <input className="bg-transparent w-full outline-none text-foreground" placeholder={interpolate(t.dashboard.kanban.searchPlace)} />
            </div>

            <div className="flex items-center bg-secondary border border-primary rounded-lg px-4 py-2 w-full lg:w-auto">
              <span className="mr-2 text-primary"><Calendar/></span>
              <input className="bg-transparent w-full outline-none text-foreground" type="date" />
            </div>
          </div>

          <button className="flex items-center gap-2 text-primary justify-center lg:justify-start">
            <span className=""><Filter size={20}/></span> {interpolate(t.dashboard.kanban.applyFilter)}
          </button>
        </div>

        {/* Kanban */}
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(data.columns).map(([columnId, column]) => (
              <div key={columnId} className="bg-secondary rounded-xl">
                <div className="bg-background px-6 py-4 rounded-t-xl">
                  <div className="flex justify-between items-center">
                    <h3 className="text-primary font-semibold">{interpolate(t.dashboard.kanban.columns[column.id] || column.title)}</h3>
                    <Ellipsis className="text-primary"/> 
                  </div>
                </div>
                <div className="px-4 pt-4">
                  <button className="w-full py-2 border-2 border-dashed bg-card rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2" style={{borderColor: 'var(--color-lemon)', color: 'var(--color-lemon)', opacity: 0.7}}>
                    <span className="text-lg">+</span>
                  </button>
                </div>
                <div className="p-4">

                  <Droppable droppableId={columnId}>
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4 min-h-[200px]"
                      >
                        {column.tasks.map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-card p-4 rounded-lg "
                              >
                                <h4 className="font-semibold mb-1 text-foreground">{task.title}</h4>
                                <p className="text-xs text-foreground opacity-60 mb-2">👥 {task.team}</p>

                                <div className="flex items-center justify-between text-xs text-foreground opacity-70">
                                  <span className="flex items-center gap-1">⏱ {task.days} {interpolate(t.dashboard.kanban.task.days)}</span>
                                  <span className="flex items-center gap-2">
                                    📎 {task.attachments} 💬 {task.comments}
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {column.tasks.length === 0 && (
                          <div className="text-center text-xs text-foreground opacity-40 py-8 select-none">
                            {interpolate(t.dashboard.kanban.empty) || "No tasks yet"}
                          </div>
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
    </>
  );
}
