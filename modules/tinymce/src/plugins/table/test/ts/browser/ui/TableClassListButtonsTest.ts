import { UiFinder, Waiter } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections, TinyUiActions } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';
import { assert } from 'chai';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableModifiedEvent } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.command.ModifyClassesCommandsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    table_class_list: [
      {
        title: 'A',
        value: 'a'
      }
    ],
    toolbar: 'tableclass',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('tablemodified', logEvent);
    }
  }, [ Plugin, Theme ], true);

  const events: Array<EditorEvent<TableModifiedEvent>> = [];
  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };

  context('When there is already a class on the table, which should not be deleted', () => {
    it('TINY-7163: Can be toggled off', async () => {
      const editor = hook.editor();

      editor.setContent(
        '<table>' +
          '<tbody>' +
            '<tr>' +
              '<td>Filler</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);

      const sugarContainer = SugarElement.fromDom(editor.getContainer());

      TinyUiActions.clickOnToolbar(editor, 'button[title="Table styles"]');

      await Waiter.pTryUntil('There should not be a checkmark', () => {
        UiFinder.exists(sugarContainer, '.tox-menu');
        UiFinder.notExists(sugarContainer, '.tox-collection__item--enabled');
      });

      editor.execCommand('mceTableToggleClass', false, 'a');
      assert.lengthOf(events, 1, 'Command executed successfully.');

      await Waiter.pTryUntil('There should be a checkmark', () => {
        UiFinder.exists(sugarContainer, '.tox-menu');
        UiFinder.exists(sugarContainer, '.tox-collection__item--enabled');
      });
    });
  });
});
