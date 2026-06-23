import React, { useState } from 'react';
import { InsightCategory, ActionItem, ExecutiveOffice } from '../types';
import { MOCK_ACTIONS } from '../constants';
import { OFFICE_LABELS } from '../config/offices';
import { OFFICE_CATEGORY_TILES, CATEGORY_STYLES } from '../config/dashboard';
import CategoryDrilldown from './CategoryDrilldown';

interface Props {
  office: ExecutiveOffice;
  meetingId?: string;
  actions?: ActionItem[];
}

const categoryConfig = CATEGORY_STYLES;

export default function OfficeDashboard({ office, meetingId, actions }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<InsightCategory | null>(null);

  const sourceActions = actions ?? MOCK_ACTIONS;
  const officeActions = sourceActions.filter(action =>
    action.offices.includes(office) && (!meetingId || action.sourceMeetingId === meetingId)
  );

  const categoryCards = OFFICE_CATEGORY_TILES.map(category => {
    const config = categoryConfig[category];
    const Icon = config.icon;
    const count = officeActions.filter(action => action.category === category).length;
    const categoryItems = officeActions.filter(action => action.category === category);

    const getSubtitle = () => {
      if (count === 0) return 'Nothing yet';
      if (category === InsightCategory.RISK && count > 0) return 'Review needed';
      if (category === InsightCategory.REGULATORY && count > 0) return 'Compliance open';
      if (categoryItems.some(item => item.dueDate)) {
        const sortedItems = categoryItems.filter(item => item.dueDate).sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
        const nextDue = sortedItems[0].dueDate;
        const month = nextDue!.split('-')[1];
        const day = nextDue!.split('-')[2];
        const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][parseInt(month) - 1];
        return `Next due ${monthName} ${day}`;
      }
      return 'Up to date';
    };

    const getCountColor = () => {
      if (category === InsightCategory.RISK && count > 0) return 'text-red-600';
      if (category === InsightCategory.REGULATORY && count > 0) return 'text-amber-600';
      return 'text-slate-800';
    };

    return (
      <button
        key={category}
        onClick={() => setSelectedCategory(category)}
        className={`p-6 rounded-xl border ${config.bgColor} ${config.borderColor} hover:shadow-md transition-all text-left ${count > 0 ? 'cursor-pointer' : 'cursor-default'}`}
      >
        <div className="flex items-center justify-between mb-3">
          <Icon className={`w-8 h-8 ${config.color}`} />
          <span className={`text-3xl font-bold ${getCountColor()}`}>{count}</span>
        </div>
        <h3 className={`font-semibold ${config.color} mb-1`}>{config.label}</h3>
        <p className={`text-xs ${count === 0 ? 'text-slate-400' : 'text-slate-600'}`}>{getSubtitle()}</p>
      </button>
    );
  });

  const attentionItems = officeActions
    .filter(action => action.priority === 'High')
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    })
    .slice(0, 5);

  if (selectedCategory) {
    return (
      <CategoryDrilldown
        office={office}
        category={selectedCategory}
        actions={officeActions}
        onBack={() => setSelectedCategory(null)}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{OFFICE_LABELS[office]}</h2>
          <p className="text-slate-600 mt-1">What changed since the last meeting</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryCards}
      </div>

      {attentionItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-4">Needs your attention</h3>
          <div className="space-y-3">
            {attentionItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      item.category === InsightCategory.RISK ? 'bg-red-100 text-red-700' :
                      item.category === InsightCategory.REGULATORY ? 'bg-amber-100 text-amber-700' :
                      item.category === InsightCategory.ISSUE ? 'bg-orange-100 text-orange-700' :
                      item.category === InsightCategory.ACTION ? 'bg-slate-100 text-slate-700' :
                      item.category === InsightCategory.PROGRAM ? 'bg-blue-100 text-blue-700' :
                      item.category === InsightCategory.OPERATIONS ? 'bg-cyan-100 text-cyan-700' :
                      item.category === InsightCategory.CEO_ITEM ? 'bg-indigo-100 text-indigo-700' :
                      item.category === InsightCategory.CFO_ITEM ? 'bg-emerald-100 text-emerald-700' :
                      'bg-purple-100 text-purple-700'
                    }}`}>{item.category}</span>
                    <span className="text-sm font-medium text-slate-900">{item.title}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">{item.description}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-xs text-slate-500">Due {item.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}