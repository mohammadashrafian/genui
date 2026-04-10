export {
  encode,
  encodeBatch,
  decode,
  decodeMessage,
  generateWireFormatPrompt,
  estimateSavings,
  WireFormatError,
} from './stream/wire-format.js';

export type { AbbreviationMap } from './stream/wire-format.js';
export type { WireMessage } from './stream/types.js';
