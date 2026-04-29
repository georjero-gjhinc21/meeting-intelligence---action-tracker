import React, { createContext, useContext, useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { DatabaseMeeting, DatabaseActionItem } from '../types/database';

interface MeetingsContextValue {
  meetings: DatabaseMeeting[];
  actionItems: DatabaseActionItem[];
  isLoading: boolean;
  refreshMeetings: () => void;
  refreshActions: () => void;
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

  return (
    <MeetingsContext.Provider
      value={{
        meetings,
        actionItems,
        isLoading: meetingsLoading || actionsLoading,
        refreshMeetings,
        refreshActions
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
