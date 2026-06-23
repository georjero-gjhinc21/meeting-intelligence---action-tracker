import React from 'react';
import { InsightCategory, ActionItem, ExecutiveOffice } from '../types';
import { OFFICE_LABELS } from '../config/offices';
import { CATEGORY_STYLES } from '../config/dashboard';
import DetailItemTable from './DetailItemTable';

interface Props {
  office: ExecutiveOffice;
  category: InsightCategory;
  actions: ActionItem[];
  onBack: () => void;
}

export default function CategoryDrilldown({ office, category, actions, onBack }: Props) {
  const config = CATEGORY_STYLES[category];
  const Icon = config.icon;

  const filteredItems = actions.filter(action =>
    action.category === category
  );

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
      >
        &larr; Back to Dashboard
      </button>

      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${config.bgColor} ${config.borderColor} border`}>
          <Icon className={`w-8 h-8 ${config.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{OFFICE_LABELS[office]} &mdash; {config.label}</h2>
          <p className="text-slate-600">
            {filteredItems.length === 0 ? 'Nothing in this category yet' :
             `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <DetailItemTable items={filteredItems} />
      </div>
    </div>
  );
}
