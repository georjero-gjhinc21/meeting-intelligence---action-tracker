export enum StakeholderRole {
  BOARD = 'Board',
  CEO = 'CEO',
  CFO = 'CFO',
  CIO = 'CIO',
  CISO = 'CISO',
  CTO = 'CTO',
  COO = 'COO'
}

export enum TrackingLevel {
  BOARD_ACTION = 'Board Action',
  TRANSFORMATION = 'Transformation',
  VISION = 'Vision',
  PROGRAM = 'Program',
  PROJECT = 'Project',
  TASK = 'Task'
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
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  platform: 'Google Meet' | 'Microsoft Teams' | 'Zoom' | 'AWS Chime';
  status: 'Processed' | 'Processing' | 'Pending';
  folderPath: string;
}
