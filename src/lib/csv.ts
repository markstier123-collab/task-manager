import { generateId } from '@/lib/id';
import { toISODate } from '@/lib/date-utils';
import { getStatus } from '@/lib/task-utils';
import { CustomFieldDef, Priority, StatusDef, Task } from '@/lib/types';

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  const len = text.length;

  while (i < len) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += char;
      i++;
      continue;
    }
    if (char === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (char === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (char === '\r') {
      i++;
      continue;
    }
    if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += char;
    i++;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''));
}

function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function stringifyCsv(rows: string[][]): string {
  return rows.map((row) => row.map(escapeCsvField).join(',')).join('\r\n');
}

const BUILTIN_COLUMN_NAMES = [
  'Label',
  'Status',
  'Priority',
  'Created At',
  'Estimated Date',
  'Blocked Reason',
  'Depends On',
] as const;

export function tasksToCsv(tasks: Task[], customFields: CustomFieldDef[], statuses: StatusDef[]): string {
  const header = [...BUILTIN_COLUMN_NAMES, ...customFields.map((f) => f.name)];
  const rows = tasks.map((task) => {
    const status = getStatus(statuses, task.status);
    const dependsOnTask = task.dependsOn ? tasks.find((t) => t.id === task.dependsOn) : undefined;
    const base = [
      task.label,
      status?.label ?? '',
      task.priority ? String(task.priority) : '',
      new Date(task.createdAt).toISOString(),
      task.estimatedDate ?? '',
      task.blockedReason ?? '',
      dependsOnTask?.label ?? '',
    ];
    const customVals = customFields.map((f) => task.customValues?.[f.id] ?? '');
    return [...base, ...customVals];
  });
  return stringifyCsv([header, ...rows]);
}

/** 'ignore' | 'label' | 'status' | 'priority' | 'createdAt' | 'estimatedDate' | 'blockedReason' | 'dependsOn' | `custom:${fieldId}` */
export type ImportTarget = string;

const BUILTIN_TARGET_ALIASES: Record<string, ImportTarget> = {
  label: 'label',
  task: 'label',
  name: 'label',
  status: 'status',
  priority: 'priority',
  'created at': 'createdAt',
  createdat: 'createdAt',
  created: 'createdAt',
  'estimated date': 'estimatedDate',
  estimateddate: 'estimatedDate',
  'due date': 'estimatedDate',
  duedate: 'estimatedDate',
  'blocked reason': 'blockedReason',
  blockedreason: 'blockedReason',
  'depends on': 'dependsOn',
  dependson: 'dependsOn',
};

export function guessImportTarget(columnName: string, customFields: CustomFieldDef[]): ImportTarget {
  const key = columnName.trim().toLowerCase();
  if (BUILTIN_TARGET_ALIASES[key]) return BUILTIN_TARGET_ALIASES[key];
  const customMatch = customFields.find((f) => f.name.trim().toLowerCase() === key);
  if (customMatch) return `custom:${customMatch.id}`;
  return 'ignore';
}

export function importTargetOptions(
  customFields: CustomFieldDef[],
): { value: ImportTarget; label: string }[] {
  return [
    { value: 'ignore', label: 'Ignore this column' },
    { value: 'label', label: 'Label' },
    { value: 'status', label: 'Status' },
    { value: 'priority', label: 'Priority' },
    { value: 'createdAt', label: 'Created At' },
    { value: 'estimatedDate', label: 'Estimated Date' },
    { value: 'blockedReason', label: 'Blocked Reason' },
    { value: 'dependsOn', label: 'Depends On' },
    ...customFields.map((f) => ({ value: `custom:${f.id}`, label: f.name })),
  ];
}

export function importTargetLabel(target: ImportTarget, customFields: CustomFieldDef[]): string {
  return importTargetOptions(customFields).find((o) => o.value === target)?.label ?? 'Ignore this column';
}

interface ImportResult {
  newTasks: Task[];
  customFields: CustomFieldDef[];
}

/** Builds new Task objects from parsed CSV rows given a column->target mapping. Pure — no state mutation. */
export function buildImportedTasks(
  rows: string[][],
  mapping: Record<number, ImportTarget>,
  statuses: StatusDef[],
  existingCustomFields: CustomFieldDef[],
): ImportResult {
  let customFields = existingCustomFields;
  const newTasks: Task[] = [];
  const dependsOnLabelByTaskId = new Map<string, string>();

  const columnsByTarget = new Map<ImportTarget, number>();
  for (const [idxStr, target] of Object.entries(mapping)) {
    if (target !== 'ignore') columnsByTarget.set(target, Number(idxStr));
  }

  rows.forEach((row, rowIndex) => {
    const getValue = (target: ImportTarget): string | undefined => {
      const idx = columnsByTarget.get(target);
      if (idx === undefined) return undefined;
      return row[idx]?.trim();
    };

    const label = getValue('label');
    if (!label) return;

    const statusLabel = getValue('status');
    const matchedStatus = statusLabel
      ? statuses.find((s) => s.label.trim().toLowerCase() === statusLabel.toLowerCase())
      : undefined;
    const status = matchedStatus ?? statuses[0];

    const priorityRaw = getValue('priority');
    const priority: Priority | undefined =
      priorityRaw === '1' || priorityRaw === '2' || priorityRaw === '3'
        ? (Number(priorityRaw) as Priority)
        : undefined;

    const createdAtRaw = getValue('createdAt');
    const parsedCreatedAt = createdAtRaw ? Date.parse(createdAtRaw) : NaN;
    const createdAt = Number.isNaN(parsedCreatedAt) ? Date.now() + rowIndex : parsedCreatedAt;

    const estimatedDateRaw = getValue('estimatedDate');
    let estimatedDate: string | undefined;
    if (estimatedDateRaw) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(estimatedDateRaw)) {
        estimatedDate = estimatedDateRaw;
      } else {
        const parsed = Date.parse(estimatedDateRaw);
        if (!Number.isNaN(parsed)) estimatedDate = toISODate(new Date(parsed));
      }
    }

    const blockedReason = getValue('blockedReason') || undefined;
    const dependsOnLabel = getValue('dependsOn') || undefined;

    const customValues: Record<string, string> = {};
    for (const field of customFields) {
      const raw = getValue(`custom:${field.id}`);
      if (raw) {
        if (!field.options.includes(raw)) {
          customFields = customFields.map((f) =>
            f.id === field.id ? { ...f, options: [...f.options, raw] } : f,
          );
        }
        customValues[field.id] = raw;
      }
    }

    const task: Task = {
      id: generateId(),
      label,
      status: status.id,
      createdAt,
      estimatedDate,
      blockedReason,
      priority,
      customValues: Object.keys(customValues).length > 0 ? customValues : undefined,
    };
    newTasks.push(task);
    if (dependsOnLabel) dependsOnLabelByTaskId.set(task.id, dependsOnLabel);
  });

  for (const task of newTasks) {
    const depLabel = dependsOnLabelByTaskId.get(task.id);
    if (depLabel) {
      const match = newTasks.find(
        (t) => t.id !== task.id && t.label.trim().toLowerCase() === depLabel.toLowerCase(),
      );
      if (match) task.dependsOn = match.id;
    }
  }

  return { newTasks, customFields };
}
