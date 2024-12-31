import React from "react";

export interface TreeItem {
  id: string;
  name: string;
  type: "folder" | "note";
  color?: string;
  children?: TreeItem[];
}

interface TreeProps {
  items: TreeItem[];
  renderItem: (item: TreeItem) => React.ReactNode;
}

export function Tree({ items, renderItem }: TreeProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <div key={item.id}>
          {renderItem(item)}
          {item.children && item.children.length > 0 && (
            <div className="ml-4 mt-1">
              <Tree items={item.children} renderItem={renderItem} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export { type TreeProps };
