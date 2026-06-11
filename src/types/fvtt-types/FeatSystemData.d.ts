import Activity from './Activity.js';
import ItemUses from './ItemUses.js';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface FeatSystemData extends foundry.abstract.DataModel<any, any> {
  activities?: Record<string, Activity>;
  uses?: ItemUses;
  actor?: Actor;
  advancement: Record<string, unknown>;
  description: {
    value: string;
    chat: string;
  };
  identifier: string;
  source: {
    revision: number;
    rules: string;
    [key: string]: unknown;
  };
  crewed: boolean;
  enchant: Record<string, unknown>;
  prerequisites: {
    items: unknown[];
    repeatable: boolean;
    level: number | null;
  };
  properties: string[];
  requirements: string;
  type: {
    value: string;
    subtype: string;
  };
  [key: string]: unknown;
}

export default FeatSystemData;
