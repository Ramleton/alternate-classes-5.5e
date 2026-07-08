import { ExploitPrerequisiteCheck } from 'automation/weaponUtils.js';
import { MidiMacroFunctionArgs } from 'chris-premades/macro.js';
import { AutoExploitWorkflow } from 'exploits/types/autoExploitTypes.js';

export type ExploitHandler = AutoExploitWorkflow;

export type AutoExploitType = 'ARC' | 'PAR';

export interface ExploitData {
  prerequisiteCheck: ExploitPrerequisiteCheck;
  handler: ExploitHandler;
  sneakAttackDiceCost: number;
}

interface PromptFunctionArgs extends MidiMacroFunctionArgs {
  deviousExploits: Record<string, ExploitData>;
}

export type PromptFunction = (args: PromptFunctionArgs) => Promise<void>;

export interface SubclassFeatureCunningStrikeData {
  identifier: string;
  preCheck: (args: MidiMacroFunctionArgs) => Promise<boolean>;
  handler: CunningStrikeSubclassFeatureHandler;
  sneakAttackDiceCost: number;
}

export interface CunningStrikeSubclassFeatureArgs extends MidiMacroFunctionArgs {
  selectedFeature: Item<'feat'>;
  target: Token;
}

export type CunningStrikePrerequisiteCheck = (
  args: CunningStrikeSubclassFeatureArgs,
) => Promise<boolean>;

export type CunningStrikeSubclassFeatureHandler = (
  args: CunningStrikeSubclassFeatureArgs,
) => Promise<unknown>;
