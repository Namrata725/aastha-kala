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
  customActions?: {
    icon: React.ReactNode;
    label: string;
    onClick: (row: any) => void;
    color?: string;
  }[];
  loading?: boolean;
  emptyMessage?: string;
}

const SkeletonRow = ({ columns }: { columns: Column[] }) => {
  return (
    <tr className="border-t border-gray-100">
      {columns.map((_, idx) => (
        <td key={idx} className="px-4 py-3">
          <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
        </td>
      ))}
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <div className="h-9 w-9 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-9 w-9 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </td>
    </tr>
  );
};

const EmptyState = ({ message }: { message: string }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400 animate-in fade-in duration-700">
      <Mailbox size={70} className="mb-3 opacity-70" />
      <p className="text-sm">{message}</p>
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
  customActions,
  loading,
  emptyMessage = "No data found",
}) => {
  // Map actions to icons + handlers
  const actionMap: Record<
    ActionType,
    {
      icon: React.ElementType;
      handler?: (row: any) => void;
      colorClass: string;
      bgClass: string;
    }
  > = {
    view: {
      icon: Eye,
      handler: onView,
      colorClass: "text-info",
      bgClass: "bg-info/10",
    },
    edit: {
      icon: Pencil,
      handler: onEdit,
      colorClass: "text-warning",
      bgClass: "bg-warning/10",
    },
    delete: {
      icon: Trash2,
      handler: onDelete,
      colorClass: "text-error",
      bgClass: "bg-error/10",
    },
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="rounded-lg bg-surface border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full border-collapse min-w-[800px]">
            {/* HEADER */}
            <thead className="bg-surface-hover/50 border-b border-border">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-text-muted"
                  >
                    {col.label}
                  </th>
                ))}

                {((actions && actions.length > 0) || (customActions && customActions.length > 0)) && (
                  <th className="px-4 py-2.5 text-[10px] font-black uppercase tracking-[0.15em] text-text-muted text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-border/50">
              {loading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <SkeletonRow key={idx} columns={columns} />
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (actions || customActions ? 1 : 0)}>
                    <EmptyState message={emptyMessage} />
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="hover:bg-surface-hover/40 transition-all duration-200 group"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-2.5 text-[13px] text-text-primary font-medium"
                      >
                        {row[col.key]}
                      </td>
                    ))}

                    {/* ACTIONS */}
                    {((actions && actions.length > 0) || (customActions && customActions.length > 0)) && (
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5 transition-opacity duration-200">
                          {actions?.map((actionKey) => {
                            const action = actionMap[actionKey];
                            if (!action) return null;

                            const Icon = action.icon;

                            return (
                              <button
                                key={actionKey}
                                onClick={() => action.handler?.(row)}
                                className={`flex items-center justify-center w-7 h-7 rounded-md ${action.bgClass} ${action.colorClass} hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer`}
                                title={actionKey.charAt(0).toUpperCase() + actionKey.slice(1)}
                              >
                                <Icon className="w-3.5 h-3.5" />
                              </button>
                            );
                          })}

                          {customActions?.map((action, idx) => (
                            <button
                              key={`custom-${idx}`}
                              onClick={() => action.onClick(row)}
                              title={action.label}
                              className={`flex items-center justify-center w-7 h-7 rounded-md bg-primary/10 text-primary hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer ${action.color || ""}`}
                            >
                              {action.icon}
                            </button>
                          ))}
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
