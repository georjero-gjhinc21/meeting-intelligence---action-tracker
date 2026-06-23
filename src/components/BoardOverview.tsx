import React from 'react';
import { User, Calendar, Hash, MapPin } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { ExecutiveOffice, InsightCategory } from '../types';
import { ACTIVE_OFFICES, OFFICE_LABELS } from '../config/offices';
import {
  BOARD_SUMMARY_TILES,
  DETAIL_TABS,
  DetailTabId,
  ExecutiveNavTarget,
  countByCategory,
  filterActionsByVisibility,
  filterActionsForMeeting,
  formatMeetingDate,
  getActionsForCategory,
  getActionsForDetailTab,
} from '../config/dashboard';
import { useVisibilityRule } from '../hooks/useUserPosition';
import { useMeetings } from '../context/MeetingsContext';
import DetailItemTable from './DetailItemTable';
import OfficeDashboard from './OfficeDashboard';

interface Props {
  navTarget?: ExecutiveNavTarget | null;
  onNavHandled?: () => void;
}

export default function BoardOverview({ navTarget, onNavHandled }: Props) {
  const visibility = useVisibilityRule();
  const { user } = useUser();
  const { meetings: allMeetings, actions: allActions } = useMeetings();

  const visibleMeetings = React.useMemo(
    () => allMeetings.filter(m => visibility.accessibleOffices.some(o => o === ExecutiveOffice.BOARD)),
    [allMeetings, visibility]
  );

  const [selectedMeetingId, setSelectedMeetingId] = React.useState<string>(
    visibleMeetings[0]?.id ?? allMeetings[0]?.id ?? ''
  );
  const [selectedOffice, setSelectedOffice] = React.useState<ExecutiveOffice>(
    visibility.accessibleOffices[0] ?? ExecutiveOffice.BOARD
  );
  const [detailTab, setDetailTab] = React.useState<DetailTabId>('actions');
  const [selectedTileCategory, setSelectedTileCategory] = React.useState<InsightCategory | null>(null);

  React.useEffect(() => {
    if (!visibleMeetings.some(meeting => meeting.id === selectedMeetingId)) {
      setSelectedMeetingId(visibleMeetings[0]?.id ?? '');
    }
  }, [visibleMeetings, selectedMeetingId]);

  React.useEffect(() => {
    if (!navTarget) return;

    switch (navTarget) {
      case 'board':
        setSelectedOffice(ExecutiveOffice.BOARD);
        setSelectedTileCategory(null);
        setDetailTab('actions');
        break;
      case 'ceo':
        setSelectedOffice(ExecutiveOffice.CEO);
        setSelectedTileCategory(null);
        break;
      case 'cfo':
        setSelectedOffice(ExecutiveOffice.CFO);
        setSelectedTileCategory(null);
        break;
      case 'risks':
        setSelectedOffice(ExecutiveOffice.BOARD);
        setDetailTab('risks');
        setSelectedTileCategory(InsightCategory.RISK);
        break;
      case 'actions':
        setSelectedOffice(ExecutiveOffice.BOARD);
        setDetailTab('actions');
        setSelectedTileCategory(InsightCategory.ACTION);
        break;
    }

    onNavHandled?.();
  }, [navTarget, onNavHandled]);

  const meetingActions = React.useMemo(() => {
    const scoped = filterActionsForMeeting(allActions, selectedMeetingId);
    return filterActionsByVisibility(scoped, visibility);
  }, [allActions, selectedMeetingId, visibility]);

  const detailItems = React.useMemo(() => {
    if (selectedTileCategory) {
      return getActionsForCategory(meetingActions, selectedTileCategory);
    }
    return getActionsForDetailTab(meetingActions, detailTab);
  }, [meetingActions, detailTab, selectedTileCategory]);

  const accessibleOffices = ACTIVE_OFFICES.filter(office => visibility.accessibleOffices.includes(office));

  const handleMeetingSelect = (meetingId: string) => {
    setSelectedMeetingId(meetingId);
    setSelectedTileCategory(null);
    setDetailTab('actions');
  };

  const handleTileClick = (category: InsightCategory, tab?: DetailTabId) => {
    setSelectedTileCategory(category);
    if (tab) setDetailTab(tab);
  };

  const handleDetailTabClick = (tabId: DetailTabId) => {
    setDetailTab(tabId);
    setSelectedTileCategory(null);
  };

  const positionLabel = typeof user?.publicMetadata?.executivePosition === 'string'
    ? user.publicMetadata.executivePosition
    : visibility.position;

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Executive Dashboard</h1>
          <p className="text-sm text-slate-500">Role-based view of what came out of your meetings</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visibility</p>
          <p className="text-xs font-semibold text-slate-700">{positionLabel}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
        {accessibleOffices.map(office => (
          <button
            key={office}
            onClick={() => {
              setSelectedOffice(office);
              setSelectedTileCategory(null);
            }}
            className={`px-4 py-2 text-sm transition-colors whitespace-nowrap rounded-t-lg ${
              selectedOffice === office
                ? 'text-indigo-700 border-b-2 border-indigo-600 font-semibold bg-white'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {OFFICE_LABELS[office]}
          </button>
        ))}
      </div>

      {selectedOffice === ExecutiveOffice.BOARD ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(280px,340px)_1fr] gap-6">
            {/* Meeting list — PPTX left panel */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1e4d6b] text-white">
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider">
                      <Hash className="w-3 h-3 inline" /> Board meeting #
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider">
                      <Calendar className="w-3 h-3 inline" /> Date
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider">
                      <User className="w-3 h-3 inline" /> Participant
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider">
                      <MapPin className="w-3 h-3 inline" /> Place
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visibleMeetings.map((meeting, idx) => {
                    const meetingNumber = visibleMeetings.length - idx;
                    const isSelected = meeting.id === selectedMeetingId;
                    return (
                      <tr
                        key={meeting.id}
                        onClick={() => handleMeetingSelect(meeting.id)}
                        className={`border-b border-slate-100 cursor-pointer transition-colors ${
                          isSelected ? 'bg-sky-100' : idx % 2 === 0 ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-3 py-2.5 font-bold text-slate-800">{meetingNumber}</td>
                        <td className="px-3 py-2.5 text-slate-700">{formatMeetingDate(meeting.date)}</td>
                        <td className="px-3 py-2.5 text-slate-600">{meeting.participant || '\u2014'}</td>
                        <td className="px-3 py-2.5 text-slate-600">{meeting.place || '\u2014'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary tiles — PPTX right panel */}
            <div className="bg-[#1e4d6b] rounded-2xl p-5 shadow-lg">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {BOARD_SUMMARY_TILES.map(tile => {
                  const count = countByCategory(meetingActions, tile.category);
                  const isActive = selectedTileCategory === tile.category;
                  return (
                    <button
                      key={tile.id}
                      onClick={() => handleTileClick(tile.category, tile.detailTab)}
                      className={`rounded-xl bg-[#e87722] text-white p-4 text-center transition-transform hover:scale-[1.02] ${
                        isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1e4d6b]' : ''
                      }`}
                    >
                      <div className="text-3xl font-bold leading-none mb-1">{count}</div>
                      <div className="text-[11px] font-semibold leading-tight">{tile.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detail tabs + table — PPTX bottom panel */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-wrap gap-2 p-3 bg-slate-100 border-b border-slate-200">
              {DETAIL_TABS.map(tab => {
                const isActive = !selectedTileCategory && detailTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleDetailTabClick(tab.id)}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#1e4d6b] text-white shadow-sm'
                        : 'bg-slate-300 text-white hover:bg-slate-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <DetailItemTable
              items={detailItems}
              emptyMessage="No items for this category in the selected meeting"
            />
          </div>
        </div>
      ) : (
        <OfficeDashboard
          office={selectedOffice}
          meetingId={selectedMeetingId}
          actions={meetingActions}
        />
      )}
    </div>
  );
}
