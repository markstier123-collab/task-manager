import { generateId } from '@/lib/id';
import { createDefaultStatuses } from '@/lib/task-utils';
import { Task, TaskList } from '@/lib/types';

const DAY_MS = 24 * 60 * 60 * 1000;

function dayOffset(days: number): string {
  const d = new Date(Date.now() + days * DAY_MS);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Builds a fresh "Example Task List" with ~15 sample tasks — shown by default for a new install. */
export function createSeedList(): TaskList {
  const now = Date.now();
  const createdAt = (stepsAgo: number) => now - stepsAgo * 5 * 60 * 1000;

  const draftPlanId = generateId();

  const tasks: Task[] = [
    {
      id: draftPlanId,
      label: 'Draft Q1 project plan',
      status: 'in_progress',
      priority: 1,
      estimatedDate: dayOffset(0),
      createdAt: createdAt(15),
    },
    {
      id: generateId(),
      label: 'Review budget spreadsheet',
      status: 'not_started',
      priority: 2,
      estimatedDate: dayOffset(0),
      createdAt: createdAt(14),
    },
    {
      id: generateId(),
      label: 'Send kickoff email to team',
      status: 'not_started',
      priority: 1,
      estimatedDate: dayOffset(1),
      createdAt: createdAt(13),
    },
    {
      id: generateId(),
      label: 'Book conference room for planning session',
      status: 'not_started',
      estimatedDate: dayOffset(1),
      createdAt: createdAt(12),
    },
    {
      id: generateId(),
      label: 'Call vendor about contract renewal',
      status: 'blocked',
      priority: 3,
      estimatedDate: dayOffset(1),
      blockedReason: 'Waiting on legal review',
      createdAt: createdAt(11),
    },
    {
      id: generateId(),
      label: 'Prepare slides for stakeholder update',
      status: 'in_progress',
      priority: 2,
      estimatedDate: dayOffset(3),
      createdAt: createdAt(10),
    },
    {
      id: generateId(),
      label: 'Update onboarding checklist',
      status: 'not_started',
      estimatedDate: dayOffset(3),
      createdAt: createdAt(9),
    },
    {
      id: generateId(),
      label: 'Research competitor pricing',
      status: 'not_started',
      estimatedDate: dayOffset(7),
      createdAt: createdAt(8),
    },
    {
      id: generateId(),
      label: 'Schedule 1:1s with direct reports',
      status: 'not_started',
      createdAt: createdAt(7),
    },
    {
      id: generateId(),
      label: 'Clean up shared drive folder structure',
      status: 'not_started',
      createdAt: createdAt(6),
    },
    {
      id: generateId(),
      label: 'Renew software licenses',
      status: 'in_review',
      priority: 1,
      estimatedDate: dayOffset(7),
      createdAt: createdAt(5),
    },
    {
      id: generateId(),
      label: 'Submit expense report',
      status: 'blocked',
      priority: 2,
      estimatedDate: dayOffset(-1),
      blockedReason: 'Missing receipts',
      createdAt: createdAt(4),
    },
    {
      id: generateId(),
      label: 'Finalize hiring rubric',
      status: 'completed',
      estimatedDate: dayOffset(0),
      completedAt: createdAt(1),
      createdAt: createdAt(3),
    },
    {
      id: generateId(),
      label: "Archive last quarter's reports",
      status: 'cancelled',
      cancelledAt: createdAt(1),
      createdAt: createdAt(2),
    },
    {
      id: generateId(),
      label: 'Draft internal newsletter',
      status: 'not_started',
      priority: 3,
      dependsOn: draftPlanId,
      createdAt: createdAt(1),
    },
  ];

  return {
    id: generateId(),
    name: 'Example Task List',
    tasks,
    statuses: createDefaultStatuses(),
    customFields: [],
    groupBy: 'due',
    sortBy: 'priority',
  };
}
