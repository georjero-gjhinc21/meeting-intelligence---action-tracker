import { ActionItem, StakeholderRole, TrackingLevel } from './types';

export const MOCK_MEETINGS = [
  {
    id: 'm1',
    title: 'Q2 Strategic Planning - Board Review',
    date: '2026-04-20',
    duration: '1h 30m',
    platform: 'Zoom',
    status: 'Processed',
    folderPath: '/Archive/Strategic/2026/Q2'
  },
  {
    id: 'm2',
    title: 'Infra Transformation Sync',
    date: '2026-04-22',
    duration: '45m',
    platform: 'Microsoft Teams',
    status: 'Processed',
    folderPath: '/Teams/Transformations'
  },
  {
    id: 'm3',
    title: 'CISO Weekly Security Update',
    date: '2026-04-25',
    duration: '30m',
    platform: 'Google Meet',
    status: 'Processing',
    folderPath: '/Google/Security'
  }
] as const;

export const MOCK_ACTIONS: ActionItem[] = [
  {
    id: 'a1',
    title: 'Approve FY27 Budget Allocation',
    description: 'Finalize board-level approval for the infrastructure transformation budget.',
    role: StakeholderRole.BOARD,
    level: TrackingLevel.BOARD_ACTION,
    status: 'Completed',
    priority: 'High',
    sourceMeetingId: 'm1',
    dueDate: '2026-05-15',
    chainOfThought: 'Derived from Board consensus at 14:20 marker regarding capital expenditure limits.'
  },
  {
    id: 'a2',
    title: 'CEO Vision: Customer First 2.0',
    description: 'Draft the vision document for the new customer experience transformation.',
    role: StakeholderRole.CEO,
    level: TrackingLevel.VISION,
    status: 'In Progress',
    priority: 'High',
    sourceMeetingId: 'm1',
    dueDate: '2026-06-01',
    chainOfThought: 'CEO emphasized "radical simplicity" multiple times during the UX segment.'
  },
  {
    id: 'a3',
    title: 'CFO Compliance Reporting',
    description: 'Ensure all transformation programs are compliant with new tax regulations.',
    role: StakeholderRole.CFO,
    level: TrackingLevel.TRANSFORMATION,
    status: 'Pending',
    priority: 'Medium',
    sourceMeetingId: 'm1',
    dueDate: '2026-07-01'
  },
  {
    id: 'a4',
    title: 'Legacy DB Migration Program',
    description: 'Oversee the migration of legacy SQL clusters to AWS RDS.',
    role: StakeholderRole.CIO,
    level: TrackingLevel.PROGRAM,
    status: 'In Progress',
    priority: 'Medium',
    sourceMeetingId: 'm2'
  },
  {
    id: 'a5',
    title: 'IAM Policy Audit',
    description: 'Execute deep audit of all identity access management policies across GCP.',
    role: StakeholderRole.CISO,
    level: TrackingLevel.PROJECT,
    status: 'Pending',
    priority: 'High',
    sourceMeetingId: 'm3'
  }
];
