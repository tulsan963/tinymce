import { context, describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinySelections } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import { assert } from 'chai';
import Editor from 'tinymce/core/api/Editor';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import { TableModifiedEvent } from 'tinymce/plugins/table/api/Events';
import Plugin from 'tinymce/plugins/table/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.table.command.ModifyClassesCommandsTest', () => {
  const platform = PlatformDetection.detect();

  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'table',
    indent: false,
    valid_styles: {
      '*': 'height,vertical-align,text-align,float,border-color,background-color,border,padding,border-spacing,border-collapse'
    },
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('tablemodified', logEvent);
    }
  }, [ Plugin, Theme ], true);

  let events: Array<EditorEvent<TableModifiedEvent>> = [];
  const logEvent = (event: EditorEvent<TableModifiedEvent>) => {
    events.push(event);
  };

  const execCmdAndAssertEvent = (editor: Editor, cmdName: string, ui?: boolean, data?: string) => {
    assert.lengthOf(events, 0, 'Before executing the command');
    editor.execCommand(cmdName, ui, data);
    assert.lengthOf(events, 1, 'Verifying after command, step 1');
    assert.equal(events[0].type, 'tablemodified', 'Verifying after command, step 2');
    assert.isFalse(events[0].structure, 'Verifying after command, step 3');
    assert.isTrue(events[0].style, 'Verifying after command, step 4');
    events = [];
  };

  context('Can use mceTableCellToggleClass to toggle the cell class', () => {
    context('When there is no class already on the cell', () => {
      const contentWithoutClass = (
        '<table>' +
          '<tbody>' +
            '<tr>' +
              (platform.browser.isIE() ? '<td>1</td>' : '<td class="">1</td>') +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      const contentWithClass = (
        '<table>' +
          '<tbody>' +
            '<tr>' +
              '<td class="a">1</td>' +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      it('TINY-7163: Can be toggled on', () => {
        const editor = hook.editor();
        editor.setContent(contentWithoutClass);

        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);

        execCmdAndAssertEvent(editor, 'mceTableCellToggleClass', false, 'a');

        assert.equal(editor.getContent(), contentWithClass);
      });

      it('TINY-7163: Can be toggled off', () => {
        const editor = hook.editor();
        editor.setContent(contentWithClass);

        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);

        execCmdAndAssertEvent(editor, 'mceTableCellToggleClass', false, 'a');

        assert.equal(editor.getContent(), contentWithoutClass);
      });
    });

    context('When there is already a class on the cell, which should not be deleted', () => {
      const contentWithoutClass = (
        '<table>' +
          '<tbody>' +
            '<tr>' +
              '<td class="b">1</td>' +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      const contentWithClass = (
        '<table>' +
          '<tbody>' +
            '<tr>' +
              '<td class="b a">1</td>' +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      it('TINY-7163: Can be toggled on', () => {
        const editor = hook.editor();
        editor.setContent(contentWithoutClass);

        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);

        execCmdAndAssertEvent(editor, 'mceTableCellToggleClass', false, 'a');

        assert.equal(editor.getContent(), contentWithClass);
      });

      it('TINY-7163: Can be toggled off', () => {
        const editor = hook.editor();
        editor.setContent(contentWithClass);

        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);

        execCmdAndAssertEvent(editor, 'mceTableCellToggleClass', false, 'a');

        assert.equal(editor.getContent(), contentWithoutClass);
      });
    });
  });

  context('Can use mceTableToggleClass to toggle the table class', () => {
    context('When there is no class already on the table', () => {
      const contentWithoutClass = (
        '<table>' +
          '<tbody>' +
            '<tr>' +
              '<td>1</td>' +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      const contentWithClass = (
        '<table class=" a">' +
          '<tbody>' +
            '<tr>' +
              '<td>1</td>' +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      it('TINY-7163: Can be toggled on', () => {
        const editor = hook.editor();
        editor.setContent(contentWithoutClass);

        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);

        execCmdAndAssertEvent(editor, 'mceTableToggleClass', false, 'a');

        assert.equal(editor.getContent(), contentWithClass);
      });

      it('TINY-7163: Can be toggled off', () => {
        const editor = hook.editor();
        editor.setContent(contentWithClass);

        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);

        execCmdAndAssertEvent(editor, 'mceTableToggleClass', false, 'a');

        assert.equal(editor.getContent(), contentWithoutClass);
      });
    });

    context('When there is already a class on the table, which should not be deleted', () => {
      const contentWithoutClass = (
        '<table class="b">' +
          '<tbody>' +
            '<tr>' +
              '<td>1</td>' +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      const contentWithClass = (
        '<table class="b a">' +
          '<tbody>' +
            '<tr>' +
              '<td>1</td>' +
              '<td>2</td>' +
            '</tr>' +
          '</tbody>' +
        '</table>'
      );

      context('Can be toggled on', () => {
        const onPathSelection = (startPath: number[], startOffset: number, endPath: number[], endOffset: number) => {
          const editor = hook.editor();
          editor.setContent(contentWithoutClass);

          TinySelections.setSelection(editor, startPath, startOffset, endPath, endOffset);

          execCmdAndAssertEvent(editor, 'mceTableToggleClass', false, 'a');

          assert.equal(editor.getContent(), contentWithClass);
        };

        it('TINY-7163: When the first cell is selected', () => {
          onPathSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);
        });

        it('TINY-7163: When the second cell is selected', () => {
          onPathSelection([ 0, 0, 0 ], 1, [ 0, 0, 0 ], 2);
        });

        it('TINY-7163: When both cells are selected', () => {
          onPathSelection([ 0, 0, 0 ], 0, [ 0, 0, 0 ], 2);
        });
      });

      it('TINY-7163: Can be toggled off', () => {
        const editor = hook.editor();
        editor.setContent(contentWithClass);

        TinySelections.setSelection(editor, [ 0, 0, 0 ], 0, [ 0, 0, 0 ], 1);

        execCmdAndAssertEvent(editor, 'mceTableToggleClass', false, 'a');

        assert.equal(editor.getContent(), contentWithoutClass);
      });
    });
  });
});
