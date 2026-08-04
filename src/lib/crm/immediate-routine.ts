import type { CommercialTask, Lead } from "./types";

export type ImmediateRoutineStatus = "overdue" | "upcoming";

export interface ImmediateRoutineItem extends CommercialTask {
  companyName: string;
  stage: Lead["stage"];
  status: ImmediateRoutineStatus;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export function buildImmediateRoutine(
  leads: Lead[],
  referenceDate = new Date()
): ImmediateRoutineItem[] {
  const referenceTime = referenceDate.getTime();
  const items: ImmediateRoutineItem[] = [];

  for (const lead of leads) {
    const title = lead.nextAction.trim();
    const dueTime = new Date(lead.nextActionAt).getTime();

    if (!title || Number.isNaN(dueTime)) {
      continue;
    }

    const difference = dueTime - referenceTime;
    const status: ImmediateRoutineStatus = difference < 0 ? "overdue" : "upcoming";

    items.push({
      id: `agenda-${lead.id}`,
      leadId: lead.id,
      companyName: lead.companyName,
      title,
      stage: lead.stage,
      dueAt: new Date(dueTime).toISOString(),
      priority: getPriority(difference),
      completed: false,
      status
    });
  }

  return items.sort(
    (first, second) =>
      new Date(first.dueAt).getTime() - new Date(second.dueAt).getTime()
  );
}

function getPriority(difference: number): CommercialTask["priority"] {
  if (difference < 0 || difference <= DAY_IN_MS) {
    return "Alta";
  }

  if (difference <= DAY_IN_MS * 3) {
    return "Média";
  }

  return "Baixa";
}
