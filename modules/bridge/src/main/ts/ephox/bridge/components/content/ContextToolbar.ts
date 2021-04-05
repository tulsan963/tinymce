import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Optional, Result } from '@ephox/katamari';
import { baseToolbarButtonFields, BaseToolbarButtonInstanceApi, BaseToolbarButtonSpec } from '../toolbar/ToolbarButton';
import { ContextBar, contextBarFields, ContextBarSpec } from './ContextBar';

export interface ContextToolbarLaunchToggleButtonSpec extends BaseToolbarButtonSpec<BaseToolbarButtonInstanceApi> {
  type: 'contextgroupbutton';
}

export interface ContextToolbarSpec extends ContextBarSpec {
  type?: 'contexttoolbar';
  items: string;
  launch?: ContextToolbarLaunchToggleButtonSpec;
}

export interface ContextToolbar extends ContextBar {
  type: 'contexttoolbar';
  items: string;
  launch: Optional<ContextToolbarLaunchToggleButtonSpec>;
}

const contextButtonFields = baseToolbarButtonFields.concat([
  FieldSchema.defaulted('type', 'contexttoolbarbutton')
]);

const contextToolbarSchema = ValueSchema.objOf([
  FieldSchema.defaulted('type', 'contexttoolbar'),
  FieldSchema.strictString('items'),
  FieldSchema.optionObjOf('launch', contextButtonFields)
].concat(contextBarFields));

export const createContextToolbar = (spec: ContextToolbarSpec): Result<ContextToolbar, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<ContextToolbar>('ContextToolbar', contextToolbarSchema, spec);
