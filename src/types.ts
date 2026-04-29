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
  salesforceId?: string;
}

export interface Meeting {
  id: string;
  title: string;
  transcript?: string;
  source?: string;
  duration?: string;
  status?: string;
  folderPath?: string;
  userId: string;
  createdAt: string;
}

// Database types for direct Supabase usage (snake_case)
export interface DatabaseMeeting {
  id: string;
  user_id: string;
  title: string;
  transcript?: string;
  source?: string;
  duration?: string;
  status?: string;
  folder_path?: string;
  created_at: string;
}

export interface DatabaseActionItem {
  id: string;
  meeting_id: string;
  user_id: string;
  title: string;
  description?: string;
  role?: string;
  level?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  chain_of_thought?: string;
  salesforce_id?: string;
  created_at: string;
}
