export enum StakeholderRole {
  LEADER = 'Leader',
  DRIVER = 'Driver',
  SUPPORTER = 'Supporter',
  CONTRIBUTOR = 'Contributor',
  INFORMED = 'Informed'
}

export enum TrackingLevel {
  BOARD_ACTION = 'Board Action',
  TRANSFORMATION = 'Transformation',
  VISION = 'Vision',
  PROGRAM = 'Program',
  PROJECT = 'Project',
  TASK = 'Task'
}

export enum ExecutiveOffice {
  BOARD = 'Board',
  CEO = 'CEO',
  CFO = 'CFO',
  CIO = 'CIO',
  CMO = 'CMO',
  CISO = 'CISO',
  CTO = 'CTO',
  COO = 'COO',
}

export enum InsightCategory {
  ACTION = 'Action',
  PROGRAM = 'Program',
  OPERATIONS = 'Operations',
  RISK = 'Risk',
  ISSUE = 'Issue',
  REGULATORY = 'Regulatory',
  MISSION = 'Mission',
  CEO_ITEM = 'CEO Item',
  CFO_ITEM = 'CFO Item',
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  role: StakeholderRole;
  level: TrackingLevel;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  sourceMeetingId: string;
  dueDate?: string;
  chainOfThought?: string;
  offices: ExecutiveOffice[];
  category: InsightCategory;
}

export type MeetingSource = 'Local' | 'Google Drive' | 'Microsoft Teams' | 'Manual';

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  platform: 'Google Meet' | 'Microsoft Teams' | 'Zoom' | 'AWS Chime' | 'Local File';
  status: 'Processed' | 'Processing' | 'Pending' | 'Failed';
  folderPath: string;
  source?: MeetingSource;
  transcript?: string;
  errorMessage?: string;
  participant?: string;
  place?: string;
}
