-- Create meetings table
create table meetings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  title text not null,
  transcript text,
  source text,
  duration text,
  status text,
  folder_path text,
  created_at timestamptz default now()
);

-- Create action_items table
create table action_items (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings on delete cascade,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  role text,
  level text,
  status text,
  priority text,
  due_date date,
  chain_of_thought text,
  salesforce_id text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table meetings enable row level security;
alter table action_items enable row level security;

-- Create policies for meetings
create policy "Users can view their own meetings"
  on meetings for select
  using (auth.uid() = user_id);

create policy "Users can insert their own meetings"
  on meetings for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own meetings"
  on meetings for update
  using (auth.uid() = user_id);

create policy "Users can delete their own meetings"
  on meetings for delete
  using (auth.uid() = user_id);

-- Create policies for action_items
create policy "Users can view their own action items"
  on action_items for select
  using (auth.uid() = user_id);

create policy "Users can insert their own action items"
  on action_items for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own action items"
  on action_items for update
  using (auth.uid() = user_id);

create policy "Users can delete their own action items"
  on action_items for delete
  using (auth.uid() = user_id);