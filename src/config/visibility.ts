import { ExecutiveOffice, InsightCategory } from '../types';

// Position defines what screens/views a role can access
// Responsibility defines what data a role can see
export type Position = 'Board Member' | 'CEO' | 'CFO' | 'CIO' | 'CMO' | 'CISO' | 'CTO' | 'COO' | 'Executive Assistant';

export interface VisibilityRule {
  position: Position;
  accessibleOffices: ExecutiveOffice[];
  accessibleCategories: InsightCategory[];
  canViewAllMeetings: boolean;
  canExport: boolean;
  canManageUsers: boolean;
}

// Position → screen visibility mapping
export const VISIBILITY_MATRIX: Record<Position, VisibilityRule> = {
  'Board Member': {
    position: 'Board Member',
    accessibleOffices: [
      ExecutiveOffice.BOARD,
      ExecutiveOffice.CEO,
      ExecutiveOffice.CFO,
    ],
    accessibleCategories: [
      InsightCategory.ACTION,
      InsightCategory.RISK,
      InsightCategory.ISSUE,
      InsightCategory.REGULATORY,
      InsightCategory.MISSION,
    ],
    canViewAllMeetings: true,
    canExport: true,
    canManageUsers: false,
  },
  CEO: {
    position: 'CEO',
    accessibleOffices: [
      ExecutiveOffice.BOARD,
      ExecutiveOffice.CEO,
      ExecutiveOffice.CFO,
      ExecutiveOffice.CMO,
      ExecutiveOffice.CIO,
    ],
    accessibleCategories: [
      InsightCategory.ACTION,
      InsightCategory.RISK,
      InsightCategory.ISSUE,
      InsightCategory.CEO_ITEM,
      InsightCategory.OPERATIONS,
      InsightCategory.MISSION,
      InsightCategory.PROGRAM,
    ],
    canViewAllMeetings: true,
    canExport: true,
    canManageUsers: true,
  },
  CFO: {
    position: 'CFO',
    accessibleOffices: [
      ExecutiveOffice.CFO,
      ExecutiveOffice.CEO,
    ],
    accessibleCategories: [
      InsightCategory.CFO_ITEM,
      InsightCategory.OPERATIONS,
      InsightCategory.ACTION,
      InsightCategory.RISK,
      InsightCategory.REGULATORY,
    ],
    canViewAllMeetings: false,
    canExport: true,
    canManageUsers: false,
  },
  CIO: {
    position: 'CIO',
    accessibleOffices: [
      ExecutiveOffice.CIO,
      ExecutiveOffice.CTO,
      ExecutiveOffice.CISO,
    ],
    accessibleCategories: [
      InsightCategory.PROGRAM,
      InsightCategory.RISK,
      InsightCategory.ACTION,
      InsightCategory.ISSUE,
    ],
    canViewAllMeetings: false,
    canExport: false,
    canManageUsers: false,
  },
  CMO: {
    position: 'CMO',
    accessibleOffices: [
      ExecutiveOffice.CMO,
      ExecutiveOffice.CEO,
    ],
    accessibleCategories: [
      InsightCategory.MISSION,
      InsightCategory.PROGRAM,
      InsightCategory.ACTION,
    ],
    canViewAllMeetings: false,
    canExport: false,
    canManageUsers: false,
  },
  CISO: {
    position: 'CISO',
    accessibleOffices: [
      ExecutiveOffice.CISO,
      ExecutiveOffice.CIO,
    ],
    accessibleCategories: [
      InsightCategory.RISK,
      InsightCategory.ISSUE,
      InsightCategory.REGULATORY,
      InsightCategory.ACTION,
    ],
    canViewAllMeetings: false,
    canExport: false,
    canManageUsers: false,
  },
  CTO: {
    position: 'CTO',
    accessibleOffices: [
      ExecutiveOffice.CTO,
      ExecutiveOffice.CIO,
    ],
    accessibleCategories: [
      InsightCategory.PROGRAM,
      InsightCategory.ACTION,
      InsightCategory.RISK,
    ],
    canViewAllMeetings: false,
    canExport: false,
    canManageUsers: false,
  },
  COO: {
    position: 'COO',
    accessibleOffices: [
      ExecutiveOffice.COO,
      ExecutiveOffice.CFO,
      ExecutiveOffice.CEO,
    ],
    accessibleCategories: [
      InsightCategory.OPERATIONS,
      InsightCategory.ACTION,
      InsightCategory.PROGRAM,
      InsightCategory.RISK,
    ],
    canViewAllMeetings: true,
    canExport: false,
    canManageUsers: false,
  },
  'Executive Assistant': {
    position: 'Executive Assistant',
    accessibleOffices: [
      ExecutiveOffice.CEO,
      ExecutiveOffice.BOARD,
    ],
    accessibleCategories: [
      InsightCategory.ACTION,
      InsightCategory.OPERATIONS,
    ],
    canViewAllMeetings: false,
    canExport: false,
    canManageUsers: false,
  },
};

// Default visibility for unknown/unauthenticated users
export const DEFAULT_VISIBILITY: VisibilityRule = {
  position: 'Executive Assistant',
  accessibleOffices: [ExecutiveOffice.CEO],
  accessibleCategories: [InsightCategory.ACTION],
  canViewAllMeetings: false,
  canExport: false,
  canManageUsers: false,
};

export function getVisibilityRule(position?: Position | string | null): VisibilityRule {
  if (position && position in VISIBILITY_MATRIX) {
    return VISIBILITY_MATRIX[position as Position];
  }
  return DEFAULT_VISIBILITY;
}


