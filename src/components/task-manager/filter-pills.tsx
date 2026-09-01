import { Fragment, useMemo } from 'react';

import { FilterDropdown } from '@/components/task-manager/filter-dropdown';
import { DueFilter, PriorityFilter, StatusDef, StatusFilter } from '@/lib/types';

interface FilterPillsProps {
  statuses: StatusDef[];
  statusFilter: StatusFilter;
  dueFilter: DueFilter;
  priorityFilter: PriorityFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onDueFilterChange: (filter: DueFilter) => void;
  onPriorityFilterChange: (filter: PriorityFilter) => void;
}

const DUE_OPTIONS: { value: string; label: string }[] = [
  { value: 'anytime', label: 'Anytime' },
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This week' },
];

const PRIORITY_OPTIONS: { value: string; label: string }[] = [
  { value: 'any', label: 'Any' },
  { value: '1', label: 'P1' },
  { value: '2', label: 'P2' },
  { value: '3', label: 'P3' },
];

export function FilterPills({
  statuses,
  statusFilter,
  dueFilter,
  priorityFilter,
  onStatusFilterChange,
  onDueFilterChange,
  onPriorityFilterChange,
}: FilterPillsProps) {
  const statusOptions = useMemo(
    () => [{ value: 'all', label: 'All' }, ...statuses.map((s) => ({ value: s.id, label: s.label }))],
    [statuses],
  );

  return (
    <Fragment>
      <FilterDropdown
        label="Status"
        options={statusOptions}
        value={statusFilter}
        onChange={(value) => onStatusFilterChange(value as StatusFilter)}
      />
      <FilterDropdown
        label="Due"
        options={DUE_OPTIONS}
        value={dueFilter}
        onChange={(value) => onDueFilterChange(value as DueFilter)}
      />
      <FilterDropdown
        label="Priority"
        options={PRIORITY_OPTIONS}
        value={priorityFilter === 'any' ? 'any' : String(priorityFilter)}
        onChange={(value) =>
          onPriorityFilterChange(value === 'any' ? 'any' : (Number(value) as 1 | 2 | 3))
        }
      />
    </Fragment>
  );
}
