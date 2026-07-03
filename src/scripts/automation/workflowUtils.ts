import { Workflow } from '@midi-qol/types/module/Workflow.js';

export const getWorkflowProperty = (
  workflow: Workflow,
  key: string,
): unknown | undefined => {
  return workflow['alternate-classes-55e']?.[key];
};

export const setWorkflowProperty = (
  workflow: Workflow,
  key: string,
  value: unknown,
) => {
  workflow['alternate-classes-55e'][key] = value;
};
