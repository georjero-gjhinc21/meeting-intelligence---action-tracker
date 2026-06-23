import React from 'react';
import { Calendar, FileText, Hash, MessageSquare, User } from 'lucide-react';
import { ActionItem } from '../types';
import { formatDisplayDate, ownerLabel } from '../config/dashboard';

interface Props {
  items: ActionItem[];
  emptyMessage?: string;
}

export default function DetailItemTable({ items, emptyMessage = 'Nothing here yet' }: Props) {
  if (items.length === 0) {
    return (
      <div className="px-6 py-12 text-center text-sm text-slate-500 bg-slate-50/70">
        {emptyMessage}
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-700 bg-[#1e4d6b] text-white">
          <th className="px-5 py-3 text-left w-12">
            <span className="text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
              <Hash className="w-3 h-3" /> #
            </span>
          </th>
          <th className="px-5 py-3 text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
              <FileText className="w-3 h-3" /> Detail
            </span>
          </th>
          <th className="px-5 py-3 text-left w-28">
            <span className="text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
              <User className="w-3 h-3" /> Owner
            </span>
          </th>
          <th className="px-5 py-3 text-left w-28">
            <span className="text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Due Date
            </span>
          </th>
          <th className="px-5 py-3 text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest inline-flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Comments
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, idx) => (
          <tr
            key={item.id}
            className={`border-b border-slate-200 ${idx % 2 === 0 ? 'bg-slate-100/80' : 'bg-white'}`}
          >
            <td className="px-5 py-3 text-xs font-bold text-slate-500 font-mono">{idx + 1}</td>
            <td className="px-5 py-3">
              <p className="font-semibold text-slate-800">{item.title}</p>
              {item.description && (
                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.description}</p>
              )}
            </td>
            <td className="px-5 py-3 text-sm font-medium text-slate-700">{ownerLabel(item)}</td>
            <td className="px-5 py-3 text-sm font-medium text-slate-700">{formatDisplayDate(item.dueDate)}</td>
            <td className="px-5 py-3">
              {item.chainOfThought ? (
                <div className="text-xs text-slate-600 whitespace-pre-line">{item.chainOfThought}</div>
              ) : (
                <span className="text-xs text-slate-400">&mdash;</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
