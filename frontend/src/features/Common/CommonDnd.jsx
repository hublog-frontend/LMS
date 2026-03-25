import React from "react";
import { Checkbox, Divider } from "antd";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const SortableItem = ({ item, index, lastIndex, handleColumnCheck }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: item.title });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
    width: "100%",
  };
  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div
          className="leadmanager_tablefiler_columnnam_container"
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
        >
          <p
            className="leadmanager_tablefiler_columnnames"
            style={{ margin: 0 }}
          >
            {item.title}
          </p>
        </div>
        <Checkbox
          style={{ marginRight: "12px" }}
          onChange={(e) => handleColumnCheck(e.target.checked, index)}
          checked={item.isChecked}
        />
      </div>

      {index !== lastIndex && (
        <Divider
          className="leadmanager_tablefiler_divider"
          style={{ margin: "8px 0" }}
        />
      )}
    </>
  );
};

export default function CommonDnd({ data, setColumns }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = data.findIndex((i) => i.title === active.id);
      const newIndex = data.findIndex((i) => i.title === over.id);
      setColumns((items) => arrayMove(items, oldIndex, newIndex));
    }
  };

  const handleColumnCheck = (checked, colIndex) => {
    const updated = data.map((item, index) =>
      index === colIndex ? { ...item, isChecked: checked } : item
    );
    setColumns(updated);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={data.map((item) => item.title)}
        strategy={verticalListSortingStrategy}
      >
        {data.map((item, index) => (
          <SortableItem
            key={item.title}
            item={item}
            index={index}
            lastIndex={data.length - 1}
            handleColumnCheck={handleColumnCheck}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
