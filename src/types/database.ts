// Database types (snake_case) as returned by Supabase
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