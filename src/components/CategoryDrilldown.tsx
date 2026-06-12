import React from 'react';
import { AlertTriangle, FileText, Shield, AlertCircle, Scale, Target } from 'lucide-react';
import { InsightCategory, ActionItem, ExecutiveOffice } from '../types';
import { MOCK_ACTIONS } from '../constants';

interface Props {
  office: ExecutiveOffice;
  category: InsightCategory;
  onBack: () => void;
}

const categoryConfig = {
  [InsightCategory.ACTION]: {
    label: 'Actions',
    icon: FileText,
    color: 'text-slate-700',
    bgColor: 'bg-white',
    borderColor: 'border-slate-200',
  },
  [InsightCategory.PROGRAM]: {
    label: 'Programs',
    icon: Target,
    color: 'text-slate-700',
    bgColor: 'bg-white',
    borderColor: 'border-slate-200',
  },
  [InsightCategory.RISK]: {
    label: 'Risks',
    icon: AlertTriangle,
    color: 'text-slate-700',
    bgColor: 'bg-white',
    borderColor: 'border-slate-200',
  },
  [InsightCategory.ISSUE]: {
    label: 'Issues',
    icon: AlertCircle,
    color: 'text-slate-700',
    bgColor: 'bg-white',
    borderColor: 'border-slate-200',
  },
  [InsightCategory.REGULATORY]: {
    label: 'Regulatory',
    icon: Shield,
    color: 'text-slate-700',
    bgColor: 'bg-white',
    borderColor: 'border-slate-200',
  },
  [InsightCategory.MISSION]: {
    label: 'Mission',
    icon: Target,
    color: 'text-slate-700',
    bgColor: 'bg-white',
    borderColor: 'border-slate-200',
  },
};

export default function CategoryDrilldown({ office, category, onBack }: Props) {
  const config = categoryConfig[category];
  const Icon = config.icon;

  const filteredItems = MOCK_ACTIONS.filter(action => 
    action.offices.includes(office) && action.category === category
  );

  const [expandedItemId, setExpandedItemId] = React.useState<string | null>(null);

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700 mb-4"
      >
        ← All categories
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className={`p-3 rounded-xl ${config.bgColor} ${config.borderColor} border`}>          <Icon className={`w-8 h-8 ${config.color}`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{config.label}</h2>
          <p className="text-slate-600">
            {filteredItems.length === 0 ? 'Nothing in this category for this office yet' : 
             filteredItems.length === 1 ? '1 item' : 
             `${filteredItems.length} items`}
          </p>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-slate-600">Nothing in {config.label.toLowerCase()} for this office yet</p>
          <p className="text-sm text-slate-500 mt-1">Check back later for new items</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                className="w-full p-5 text-left hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.bgColor} ${config.color}`}>{item.category}</span>
                      <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        item.priority === 'High' ? 'bg-red-100 text-red-700' :
                        item.priority === 'Medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>{item.priority}</span>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2">{item.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-xs text-slate-500 mb-1">Due {item.dueDate}</p>
                    <p className="text-xs text-slate-400">Role: {item.role}</p>
                  </div>
                </div>
              </button>

              {expandedItemId === item.id && (
                <div className="px-5 pb-5 border-t border-slate-100 bg-slate-50">
                  <div className="pt-4">
                    <h4 className="text-sm font-semibold text-slate-900 mb-2">Why this was flagged</h4>
                    <p className="text-sm text-slate-700 leading-relaxed">{item.chainOfThought}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}