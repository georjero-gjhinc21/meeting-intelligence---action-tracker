import { ActionItem, ExecutiveOffice, InsightCategory, Meeting } from '../types';
import { VisibilityRule } from './visibility';
import {
  FileText, Target, Settings2, AlertTriangle, AlertCircle,
  Shield, Crown, PiggyBank, LucideIcon,
} from 'lucide-react';

export interface CategoryStyle {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const CATEGORY_STYLES: Record<InsightCategory, CategoryStyle> = {
  [InsightCategory.ACTION]: {
    label: 'Actions', icon: FileText,
    color: 'text-slate-700', bgColor: 'bg-white', borderColor: 'border-slate-200',
  },
  [InsightCategory.PROGRAM]: {
    label: 'Programs', icon: Target,
    color: 'text-slate-700', bgColor: 'bg-white', borderColor: 'border-slate-200',
  },
  [InsightCategory.OPERATIONS]: {
    label: 'Operations', icon: Settings2,
    color: 'text-slate-700', bgColor: 'bg-white', borderColor: 'border-slate-200',
  },
  [InsightCategory.RISK]: {
    label: 'Risks', icon: AlertTriangle,
    color: 'text-slate-700', bgColor: 'bg-white', borderColor: 'border-slate-200',
  },
  [InsightCategory.ISSUE]: {
    label: 'Issues', icon: AlertCircle,
    color: 'text-slate-700', bgColor: 'bg-white', borderColor: 'border-slate-200',
  },
  [InsightCategory.REGULATORY]: {
    label: 'Regulatory', icon: Shield,
    color: 'text-slate-700', bgColor: 'bg-white', borderColor: 'border-slate-200',
  },
  [InsightCategory.MISSION]: {
    label: 'Mission', icon: Target,
    color: 'text-slate-700', bgColor: 'bg-white', borderColor: 'border-slate-200',
  },
  [InsightCategory.CEO_ITEM]: {
    label: 'CEO Items', icon: Crown,
    color: 'text-indigo-700', bgColor: 'bg-indigo-50', borderColor: 'border-indigo-200',
  },
  [InsightCategory.CFO_ITEM]: {
    label: 'CFO Items', icon: PiggyBank,
    color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200',
  },
};

export type DetailTabId = 'actions' | 'ceo' | 'cfo' | 'operations' | 'risks' | 'issues' | 'regulatory';

export type ExecutiveNavTarget = 'board' | 'ceo' | 'cfo' | 'risks' | 'actions';

export interface SummaryTileConfig {
  id: string;
  label: string;
  category: InsightCategory;
  detailTab?: DetailTabId;
}

export interface DetailTabConfig {
  id: DetailTabId;
  label: string;
  categories: InsightCategory[];
}

/** Nine summary tiles shown for the selected board meeting (PPTX slide 10). */
export const BOARD_SUMMARY_TILES: SummaryTileConfig[] = [
  { id: 'actions', label: 'Actions', category: InsightCategory.ACTION, detailTab: 'actions' },
  { id: 'risks', label: 'Risks', category: InsightCategory.RISK, detailTab: 'risks' },
  { id: 'issues', label: 'Issues', category: InsightCategory.ISSUE },
  { id: 'ops', label: 'Ops', category: InsightCategory.OPERATIONS, detailTab: 'operations' },
  { id: 'ceo', label: 'CEO related', category: InsightCategory.CEO_ITEM, detailTab: 'ceo' },
  { id: 'cfo', label: 'CFO Related', category: InsightCategory.CFO_ITEM, detailTab: 'cfo' },
  { id: 'projects', label: 'New Projects', category: InsightCategory.PROGRAM },
  { id: 'regulatory', label: 'Regulatory', category: InsightCategory.REGULATORY },
];

export const DETAIL_TABS: DetailTabConfig[] = [
  { id: 'actions', label: 'Actions', categories: [InsightCategory.ACTION] },
  { id: 'ceo', label: 'CEO', categories: [InsightCategory.CEO_ITEM] },
  { id: 'cfo', label: 'CFO', categories: [InsightCategory.CFO_ITEM] },
  { id: 'operations', label: 'Operations', categories: [InsightCategory.OPERATIONS] },
  { id: 'risks', label: 'Risks', categories: [InsightCategory.RISK] },
  { id: 'issues', label: 'Issues', categories: [InsightCategory.ISSUE] },
  { id: 'regulatory', label: 'Regulatory', categories: [InsightCategory.REGULATORY] },
];

export const OFFICE_CATEGORY_TILES: InsightCategory[] = [
  InsightCategory.ACTION,
  InsightCategory.PROGRAM,
  InsightCategory.RISK,
  InsightCategory.ISSUE,
  InsightCategory.REGULATORY,
  InsightCategory.MISSION,
];

export function filterActionsForMeeting(actions: ActionItem[], meetingId: string): ActionItem[] {
  return actions.filter(action => action.sourceMeetingId === meetingId);
}

export function filterActionsByVisibility(actions: ActionItem[], rule: VisibilityRule): ActionItem[] {
  return actions.filter(
    action =>
      action.offices.some(office => rule.accessibleOffices.includes(office)) &&
      rule.accessibleCategories.includes(action.category)
  );
}

export function countByCategory(actions: ActionItem[], category: InsightCategory): number {
  return actions.filter(action => action.category === category).length;
}

export function getActionsForDetailTab(actions: ActionItem[], tabId: DetailTabId): ActionItem[] {
  const tab = DETAIL_TABS.find(entry => entry.id === tabId);
  if (!tab) return [];
  return actions.filter(action => tab.categories.includes(action.category));
}

export function getActionsForCategory(actions: ActionItem[], category: InsightCategory): ActionItem[] {
  return actions.filter(action => action.category === category);
}

export function formatDisplayDate(isoDate?: string): string {
  if (!isoDate) return '\u2014';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year.slice(2)}`;
}

export function formatMeetingDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

export function ownerLabel(action: ActionItem): string {
  if (action.category === InsightCategory.CEO_ITEM) return 'CEO';
  if (action.category === InsightCategory.CFO_ITEM) return 'CFO';
  if (action.offices.includes(ExecutiveOffice.BOARD)) return 'Board';
  if (action.offices.includes(ExecutiveOffice.CEO)) return 'CEO';
  if (action.offices.includes(ExecutiveOffice.CFO)) return 'CFO';
  return action.role;
}
