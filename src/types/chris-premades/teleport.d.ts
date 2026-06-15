/* eslint-disable @typescript-eslint/no-explicit-any */
export default class Teleport {
  constructor(tokens: Token[], controllingToken: Token, options: object);
  template: { direction: number; x: number; y: number };
  static group(
    tokens: Token[],
    controllingToken: Token,
    options?: {
      animation?: string;
      isSynchronous?: boolean;
      crosshairsConfig?: any;
      callbacks?: any;
      range?: number;
      updates?: any;
      minimizeSheet?: boolean;
      centerpoint?: { x: number; y: number };
    }
  ): Promise<void>;
  static target(
    target: Token | Token[],
    controllingToken: Token,
    options?: {
      animation?: string;
      isSynchronous?: boolean;
      crosshairsConfig?: any;
      callbacks?: any;
      range?: number;
      updates?: any;
      minimizeSheet?: boolean;
      centerpoint?: { x: number; y: number };
    }
  ): Promise<void>;
  go(
    crosshairsConfig: any,
    minimizeSheet?: boolean
  ): Promise<void>;
  getCoords(token: Token): {
    x: number;
    y: number;
    rotation: number;
  };
  _move(): Promise<void>;
  _moveGroup(): Promise<void>;
  _nonSync(): Promise<void>;
  _sync(): Promise<void>;
};
