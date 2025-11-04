import { closestCenter, DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";
import { useMemo, useState } from "react";
import { DraggableImage } from "./draggable-image";
import type { DragEndEvent, DragStartEvent, UniqueIdentifier } from "@dnd-kit/core";
import type { productMultimedia } from "@/lib/database/schema";

interface DragAndDropMediaProps {
  items: (typeof productMultimedia.$inferSelect)[];
  setItems: React.Dispatch<React.SetStateAction<(typeof productMultimedia.$inferSelect)[]>>;
  invalidate: () => unknown;
}

export function DragAndDropMedia({ items, setItems, invalidate }: DragAndDropMediaProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  const dataIds = useMemo<UniqueIdentifier[]>(() => items.map((item: { id: UniqueIdentifier }) => item.id), [items]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (active && over && active.id !== over.id) {
      setItems((data: typeof items) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  const activeItem = activeId ? items.find((item: { id: UniqueIdentifier }) => item.id === activeId) : null;

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd} onDragStart={handleDragStart} sensors={sensors}>
      <SortableContext items={dataIds} strategy={rectSortingStrategy}>
        {items.map((item, index) => (
          <DraggableImage invalidate={invalidate} key={item.id} productImage={{ ...item, order: index + 1 }} />
        ))}
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <div className="relative size-40 scale-105 overflow-hidden rounded-2xl opacity-95 shadow-lg">
            <div className="absolute top-2 left-2 z-10 select-none rounded-md bg-secondary px-2 py-1 font-semibold text-secondary-foreground text-xs">
              {activeItem.order}
            </div>
            {/** biome-ignore lint/correctness/useImageSize: <explanation> */}
            <img alt="" className="object-cover" src={activeItem.url} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
