export { createShadcnRegistry, shadcnComponents } from './factory.js';
export type { ShadcnComponentName } from './factory.js';

// Individual schemas for customization
export {
  buttonSchema,
  cardSchema,
  alertSchema,
  badgeSchema,
  inputSchema,
  selectSchema,
  dialogSchema,
  tabsSchema,
  tableSchema,
  avatarSchema,
} from './schemas.js';

// Action schemas
export {
  buttonActions,
  inputActions,
  selectActions,
  dialogActions,
  tabsActions,
} from './actions.js';
