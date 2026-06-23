import { ExecutiveOffice, InsightCategory } from '../types';

export const ACTIVE_OFFICES: ExecutiveOffice[] = [
  ExecutiveOffice.BOARD,
  ExecutiveOffice.CEO,
  ExecutiveOffice.CFO,
  ExecutiveOffice.CIO,
  ExecutiveOffice.CMO,
];

export const OFFICE_LABELS: Record<ExecutiveOffice, string> = {
  Board: 'Board',
  CEO: 'Office of the CEO',
  CFO: 'Office of the CFO',
  CIO: 'Office of the CIO',
  CMO: 'Office of the CMO',
  CISO: 'Office of the CISO',
  CTO: 'Office of the CTO',
  COO: 'Office of the COO',
};

export function deriveCategoryFromLevel(level: string): InsightCategory {
  switch (level) {
    case 'Board Action':
      return InsightCategory.ACTION;
    case 'Transformation':
    case 'Vision':
      return InsightCategory.MISSION;
    case 'Program':
      return InsightCategory.PROGRAM;
    case 'Project':
    case 'Task':
      return InsightCategory.ACTION;
    default:
      return InsightCategory.ACTION;
  }
}

export function deriveOfficesFromRole(role: string): ExecutiveOffice[] {
  switch (role) {
    case 'Leader':
      return [ExecutiveOffice.BOARD];
    case 'Driver':
      return [ExecutiveOffice.CEO];
    case 'Contributor':
      return [ExecutiveOffice.CFO];
    case 'Supporter':
      return [ExecutiveOffice.CIO];
    case 'Informed':
      return [ExecutiveOffice.CMO];
    default:
      return [ExecutiveOffice.CEO];
  }
}

