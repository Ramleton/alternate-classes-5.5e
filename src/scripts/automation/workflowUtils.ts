import { Workflow } from '@midi-qol/types/module/Workflow.js';

export const getWorkflowProperty = (
  workflow: Workflow,
  actor: Actor5e,
  key: string,
): unknown | undefined => {
  return workflow['alternate-classes-55e']?.[actor.id!]?.[key];
};

export const setWorkflowProperty = (
  workflow: Workflow,
  actor: Actor5e,
  key: string,
  value: unknown,
) => {
  workflow['alternate-classes-55e'][actor.id!][key] = value;
};
