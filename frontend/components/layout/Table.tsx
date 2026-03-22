"use client";

import { Mailbox, Eye, Pencil, Trash2 } from "lucide-react";
import React from "react";

interface Column {
  key: string;
  label: string;
}

type ActionType = "view" | "edit" | "delete";

interface Props {
  columns: Column[];
  data: any[];
  actions?: ActionType[];
  onView?: (row: any) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  loading?: boolean;
}

const SkeletonRow = ({ columns }: { columns: Column[] }) => {
  return (
    <tr className="border-t border-primary/20">
      {columns.map((_, idx) => (
        <td key={idx} className="px-4 py-3">
          <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        </td>
      ))}
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <div className="h-9 w-9 bg-white/10 rounded-lg animate-pulse" />
          <div className="h-9 w-9 bg-white/10 rounded-lg animate-pulse" />
        </div>
      </td>
    </tr>
  );
};

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-black/60 animate-fadeIn">
      <Mailbox size={70} className="mb-3 opacity-70" />
      <p className="text-sm">No contacts yet</p>
    </div>
  );
};

const Table: React.FC<Props> = ({
  columns,
  data,
  actions,
  onView,
  onEdit,
  onDelete,
  loading,
}) => {
  // Map actions to icons + handlers
  const actionMap: Record<
    ActionType,
    {
      icon: React.ElementType;
      handler?: (row: any) => void;
      color: string;
    }
  > = {
    view: {
      icon: Eye,
      handler: onView,
      color: "#3b82f6",
    },
    edit: {
      icon: Pencil,
      handler: onEdit,
      color: "#f59e0b",
    },
    delete: {
      icon: Trash2,
      handler: onDelete,
      color: "#ef4444",
    },
  };

  return (
    <div className="w-full">
      {/* Gradient Border Wrapper */}
      <div className="p-[1px] rounded-2xl bg-gradient-to-r from-primary/30 to-secondary/30">
        <div className="rounded-2xl bg-primary/10 backdrop-blur-xl border border-primary/20 overflow-hidden">
          <table className="w-full border-collapse">
            {/* HEADER */}
            <thead className="bg-gradient-to-r from-primary to-secondary">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left px-4 py-3 text-sm font-semibold text-white/90"
                  >
                    {col.label}
                  </th>
                ))}

                {actions && actions.length > 0 && (
                  <th className="px-4 py-3 text-sm font-semibold text-white/90">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <SkeletonRow key={idx} columns={columns} />
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (actions ? 1 : 0)}>
                    <EmptyState />
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="border-t border-primary/20 hover:bg-primary/5 transition duration-200"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-sm text-black/80"
                      >
                        {row[col.key]}
                      </td>
                    ))}

                    {/* ACTIONS */}
                    {actions && actions.length > 0 && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 ">
                          {actions.map((actionKey) => {
                            const action = actionMap[actionKey];
                            if (!action) return null;

                            const Icon = action.icon;

                            return (
                              <div
                                key={actionKey}
                                className="p-[1px] rounded-lg bg-gradient-to-r from-primary/30 to-secondary/30"
                              >
                                <button
                                  onClick={() => action.handler?.(row)}
                                  className="flex items-center justify-center w-7 h-7 rounded-lg 
                                  bg-primary/10 backdrop-blur-md border border-primary/20
                                  hover:bg-primary/20 hover:scale-105 active:scale-95
                                  hover:shadow-[0_0_10px_rgba(255,255,255,0.15)]
                                  transition duration-200 cursor-pointer"
                                >
                                  <Icon
                                    className="w-4 h-4"
                                    style={{
                                      color: action.color,
                                    }}
                                  />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Table;
