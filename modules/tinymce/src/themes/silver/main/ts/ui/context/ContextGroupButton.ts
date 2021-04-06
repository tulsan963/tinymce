import { Button as AlloyButton } from '@ephox/alloy';
import { Optional } from '@ephox/katamari';
import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { renderRtlAdjustedIconFromPack } from '../button/ButtonSlices';
import { ToolbarButtonClasses } from '../toolbar/button/ButtonClasses';
import { renderCommonSpec } from '../toolbar/button/ToolbarButtons';

export const renderContextToolbarReturnButton = (onAction, providersBackstage: UiFactoryBackstageProviders) => {
  const commonSpec = renderCommonSpec(
    providersBackstage,
    [],
    Optional.some('Return'),
    [ ToolbarButtonClasses.ButtonNarrow ],
    [ renderRtlAdjustedIconFromPack(`chevron-left`, providersBackstage.icons) ]
  );
  return AlloyButton.sketch({
    action: onAction,
    ...commonSpec
  });
};
