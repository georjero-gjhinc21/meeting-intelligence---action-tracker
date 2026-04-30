import React, { createContext, useContext, useState, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { Meeting, ActionItem } from '../types';
import { MOCK_MEETINGS, MOCK_ACTIONS } from '../constants';

interface MeetingsContextValue {
  meetings: Meeting[];
  actions: ActionItem[];
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  removeMeeting: (id: string) => void;
  addActions: (actions: ActionItem[]) => void;
}

const MeetingsContext = createContext<MeetingsContextValue | null>(null);

export function MeetingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [meetings, setMeetings] = useState<Meeting[]>(MOCK_MEETINGS);
  const [actions, setActions] = useState<ActionItem[]>(MOCK_ACTIONS);

  const addMeeting = useCallback((meeting: Meeting) => {
    setMeetings(prev => [meeting, ...prev]);
  }, []);

  const updateMeeting = useCallback((id: string, updates: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const removeMeeting = useCallback((id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
    setActions(prev => prev.filter(a => a.sourceMeetingId !== id));
  }, []);

  const addActions = useCallback((newActions: ActionItem[]) => {
    setActions(prev => [...newActions, ...prev]);
  }, []);

  return (
    <MeetingsContext.Provider
      value={{
        meetings,
        actions,
        addMeeting,
        updateMeeting,
        removeMeeting,
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
