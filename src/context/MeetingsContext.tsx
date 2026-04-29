import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Meeting, ActionItem } from '../types';
import { MOCK_MEETINGS, MOCK_ACTIONS } from '../constants';

interface MeetingsContextValue {
  meetings: Meeting[];
  actions: ActionItem[];
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, patch: Partial<Meeting>) => void;
  addActions: (actions: ActionItem[]) => void;
  removeMeeting: (id: string) => void;
  clearAll: () => void;
}

const MeetingsContext = createContext<MeetingsContextValue | null>(null);

export function MeetingsProvider({ children }: { children: ReactNode }) {
  const [meetings, setMeetings] = useState<Meeting[]>(() => [...MOCK_MEETINGS] as unknown as Meeting[]);
  const [actions, setActions] = useState<ActionItem[]>(() => [...MOCK_ACTIONS]);

  const addMeeting = useCallback((m: Meeting) => {
    setMeetings(prev => [m, ...prev]);
  }, []);

  const updateMeeting = useCallback((id: string, patch: Partial<Meeting>) => {
    setMeetings(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const addActions = useCallback((newActions: ActionItem[]) => {
    setActions(prev => [...newActions, ...prev]);
  }, []);

  const removeMeeting = useCallback((id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id));
    setActions(prev => prev.filter(a => a.sourceMeetingId !== id));
  }, []);

  const clearAll = useCallback(() => {
    setMeetings([]);
    setActions([]);
  }, []);

  return (
    <MeetingsContext.Provider
      value={{ meetings, actions, addMeeting, updateMeeting, addActions, removeMeeting, clearAll }}
    >
      {children}
    </MeetingsContext.Provider>
  );
}

export function useMeetings() {
  const ctx = useContext(MeetingsContext);
  if (!ctx) throw new Error('useMeetings must be used within MeetingsProvider');
  return ctx;
}
