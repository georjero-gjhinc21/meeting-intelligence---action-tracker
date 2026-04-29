import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { DatabaseMeeting, DatabaseActionItem } from '../types/database';

interface MeetingsContextValue {
  meetings: DatabaseMeeting[];
  actionItems: DatabaseActionItem[];
  actions: DatabaseActionItem[]; // Alias for compatibility
  isLoading: boolean;
  refreshMeetings: () => void;
  refreshActions: () => void;
  addActions: (actions: Partial<DatabaseActionItem>[]) => Promise<void>;
}

const MeetingsContext = createContext<MeetingsContextValue | null>(null);

export function MeetingsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // Fetch current user
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    }
  });

  // Fetch meetings
  const { data: meetings = [], isLoading: meetingsLoading } = useQuery({
    queryKey: ['meetings', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DatabaseMeeting[];
    },
    enabled: !!user?.id
  });

  // Fetch action items
  const { data: actionItems = [], isLoading: actionsLoading } = useQuery({
    queryKey: ['action_items', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('action_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as DatabaseActionItem[];
    },
    enabled: !!user?.id
  });

  const refreshMeetings = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['meetings'] });
  }, [queryClient]);

  const refreshActions = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['action_items'] });
  }, [queryClient]);

  const addActions = useCallback(async (actions: Partial<DatabaseActionItem>[]) => {
    if (!user?.id) throw new Error('Not authenticated');

    const actionRecords = actions.map(action => ({
      ...action,
      user_id: user.id,
      meeting_id: action.meeting_id || null,
      status: action.status || 'Pending'
    }));

    const { error } = await supabase
      .from('action_items')
      .insert(actionRecords);

    if (error) throw error;

    refreshActions();
  }, [user?.id, refreshActions]);

  return (
    <MeetingsContext.Provider
      value={{
        meetings,
        actionItems,
        actions: actionItems, // Alias for compatibility
        isLoading: meetingsLoading || actionsLoading,
        refreshMeetings,
        refreshActions,
        addActions
      }}
    >
      {children}
    </MeetingsContext.Provider>
  );
}

export function useMeetings() {
  const context = useContext(MeetingsContext);
  if (!context) {
    throw new Error('useMeetings must be used within MeetingsProvider');
  }
  return context;
}
