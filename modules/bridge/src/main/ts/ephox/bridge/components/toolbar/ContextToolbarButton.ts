import { FieldSchema, ValueSchema } from '@ephox/boulder';
import { Result } from '@ephox/katamari';
import { BaseToolbarButton, BaseToolbarButtonSpec, baseToolbarButtonFields, BaseToolbarButtonInstanceApi } from './ToolbarButton';

// tslint:disable-next-line:no-empty-interface
export interface ContextToolbarButtonInstanceApi extends BaseToolbarButtonInstanceApi {}

export interface ContextToolbarButtonSpec extends BaseToolbarButtonSpec<ContextToolbarButtonInstanceApi> {
  type?: 'contexttoolbarbutton';
  onAction: (api: ContextToolbarButtonInstanceApi) => void;
}

export interface ContextToolbarButton extends BaseToolbarButton<ContextToolbarButtonInstanceApi> {
  type: 'contexttoolbarbutton';
  onAction: (api: ContextToolbarButtonInstanceApi) => void;
}

export const contextToolbarButtonSchema = ValueSchema.objOf(
  baseToolbarButtonFields.concat([
    FieldSchema.defaulted('type', 'contexttoolbarbutton'),
    FieldSchema.strictFunction('onAction')
  ])
);

export const createContextToolbarButton = (spec: ContextToolbarButtonSpec): Result<ContextToolbarButton, ValueSchema.SchemaError<any>> =>
  ValueSchema.asRaw<ContextToolbarButton>('ContextToolbarButton', contextToolbarButtonSchema, spec);
