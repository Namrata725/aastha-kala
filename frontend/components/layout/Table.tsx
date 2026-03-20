"use client";

import { Mailbox } from "lucide-react";
import React from "react";

interface Column {
  key: string;
  label: string;
}

interface Action {
  icon: React.ElementType; // Lucide icon
  onClick: (row: any) => void;
  color?: string;
}

interface Props {
  columns: Column[];
  data: any[];
  actions?: Action[];
  loading?: boolean;
}

const SkeletonRow = ({ columns }: { columns: Column[] }) => {
  return (
    <tr className="border-t border-white/10">
      {columns.map((col, idx) => (
        <td key={idx} className="px-4 py-3">
          <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
        </td>
      ))}
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
          <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
        </div>
      </td>
    </tr>
  );
};

const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-white/60 animate-fadeIn">
      <div className="text-4xl mb-3 animate-bounce">
        <Mailbox size={80} />
      </div>
      <p className="text-sm">No data found</p>
    </div>
  );
};

const Table: React.FC<Props> = ({ columns, data, actions, loading }) => {
  return (
    <div className="w-full">
      {/* Outer gradient border */}
      <div
        className="relative max-w-7xl mx-auto rounded-2xl overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(0,0,0,0.2))",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <div className="rounded-xl backdrop-blur-md bg-primary/10 border border-primary/10 ">
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
                  <th className="text-left px-4 py-3 text-sm font-semibold text-white/90">
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
                    className="border-t border-primary/10 hover:bg-primary/5 transition"
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-4 py-3 text-lg text-white/80"
                      >
                        {row[col.key]}
                      </td>
                    ))}

                    {actions && actions.length > 0 && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {actions.map((action, idx) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={idx}
                                onClick={() => action.onClick(row)}
                                className="p-[5px] rounded-lg bg-black/25 hover:bg-white/10 transition border border-white/65 cursor-pointer"
                              >
                                <Icon
                                  className="w-5 h-5"
                                  style={{ color: action.color || "white" }}
                                />
                              </button>
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
