// TODO: Alloy must go through tinymce's APIs
import { AddEventsBehaviour, AlloyComponent, AlloyEvents, Behaviour, Boxes, Button, Container, GuiFactory, InlineView, Layout, MaxHeight, MaxWidth, NativeEvents, Replacing, Toggling } from '@ephox/alloy';
import { SelectionAnnotation } from '@ephox/darwin';
import { Arr, Fun, Obj, Optional, Optionals, Result } from '@ephox/katamari';
import { Blocks, Warehouse } from '@ephox/snooker';
import { DetailExt } from '@ephox/snooker/src/main/ts/ephox/snooker/api/Structs'; // TODO:
import { Attribute, Height, SelectorFind, SugarElement, SugarNode, Width } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstageShared } from './backstage/Backstage';
import { ephemera } from './Ephemera'; // TODO: this is a 100% copy from the table plugin...
import { get as getIcon } from './ui/icons/Icons';

const createComps = (lazySink: () => Result<AlloyComponent, Error>) => {
  const colSelectionComp = GuiFactory.build(InlineView.sketch({
    fireDismissalEventInstead: { }, // Must be used, otherwise the dismissal event will be fired
    dom: {
      tag: 'div',
    },
    inlineBehaviours: Behaviour.derive([
      /* Docking.config({ // TODO: Need to create docking for editor content area container and editor scroll. See ActiveDocking.ts:23
        contextual: {
          lazyContext: () => {
            const box = Boxes.box(SugarElement.fromDom(editor.getContentAreaContainer()));
            return Optional.some(Boxes.bounds(box.x, box.y + 100, box.width, box.height));
          },
          fadeInClass: 'tox-dialog-dock-fadein',
          fadeOutClass: 'tox-dialog-dock-fadeout',
          transitionClass: 'tox-dialog-dock-transition'
        },
        // lazyViewport: () => {
        //   const box = Boxes.box(SugarElement.fromDom(editor.getContentAreaContainer()));
        //   return Boxes.bounds(box.x, box.y + 100, box.width, box.height);
        // },
        modes: [ 'top' ],
        onDocked: () => {
          debugger;
        },
      }) */
    ]),
    lazySink
  }));

  const rowSelectionComp = GuiFactory.build(InlineView.sketch({
    fireDismissalEventInstead: { },
    dom: {
      tag: 'div',
    },
    lazySink
  }));

  const cellSelectionComp = GuiFactory.build(
    InlineView.sketch({
      fireDismissalEventInstead: { },
      dom: {
        tag: 'div',
      },
      lazySink
    })
  );

  const deleteRowButtonComp = GuiFactory.build(
    InlineView.sketch({
      fireDismissalEventInstead: { },
      dom: {
        tag: 'div',
      },
      lazySink
    })
  );

  const deleteColButtonComp = GuiFactory.build(
    InlineView.sketch({
      fireDismissalEventInstead: { },
      dom: {
        tag: 'div',
      },
      lazySink
    })
  );

  return {
    colSelectionComp,
    rowSelectionComp,
    cellSelectionComp,
    deleteRowButtonComp,
    deleteColButtonComp
  };
};

const setupTableUi = (editor: Editor, lazySink: () => Result<AlloyComponent, Error>, sharedBackstage: UiFactoryBackstageShared) => {
  editor.on('PostRender', () => {
    const root = SugarElement.fromDom(editor.getBody());

    const { colSelectionComp, rowSelectionComp, cellSelectionComp, deleteRowButtonComp, deleteColButtonComp } = createComps(lazySink);

    const annotations = SelectionAnnotation.byAttr(
      ephemera,
      Fun.noop, // TODO: See CellSelection.ts:36
      Fun.noop // TODO: See CellSelection.ts:36
    );

    const isSelected = (elm: SugarElement<HTMLElement>) => Attribute.get(elm, 'data-mce-selected') === '1';

    const isColSelected = (table: SugarElement<HTMLTableElement>, index: number) => {
      const cells = Warehouse.justCells(Warehouse.fromTable(table));
      const cellsInCol = Arr.filter(cells, (cell) => cell.column === index);
      return cellsInCol.length > 0 && Arr.forall(cellsInCol, (cell) => isSelected(cell.element));
    };

    const isRowSelected = (table: SugarElement<HTMLTableElement>, index: number) => {
      const cells = Warehouse.justCells(Warehouse.fromTable(table));
      const cellsInRow = Arr.filter(cells, (cell) => cell.row === index);
      return cellsInRow.length > 0 && Arr.forall(cellsInRow, (cell) => isSelected(cell.element));
    };

    const hasSelectedCol = (table: SugarElement<HTMLTableElement>) => Arr.contains(Arr.range(Warehouse.fromTable(table).grid.columns, (i) => isColSelected(table, i)), true);
    const hasSelectedRow = (table: SugarElement<HTMLTableElement>) => Arr.contains(Arr.range(Warehouse.fromTable(table).grid.rows, (i) => isRowSelected(table, i)), true);
    const isFullySelectedTable = (table: SugarElement<HTMLTableElement>) => hasSelectedCol(table) && hasSelectedRow(table);

    const renderChevronButton = () => Button.sketch({
      dom: {
        tag: 'div',
        styles: {
          fill: 'white',
        },
        innerHtml: getIcon('chevron-down', sharedBackstage.providers.icons)
      },
      buttonBehaviours: Behaviour.derive([
        AddEventsBehaviour.config('button press', [
          AlloyEvents.preventDefault('click'),
          AlloyEvents.preventDefault('mousedown')
        ])
      ]),
      eventOrder: {
        click: [ 'button press', 'alloy.base.behaviour' ],
        mousedown: [ 'button press', 'alloy.base.behaviour' ]
      },
      action: () => {
        console.log('Opening menu'); // TODO: need to create a new kind of menu, similar to context menu
      }
    });

    const renderDeleteButton = (action: () => void) => Button.sketch({
      dom: {
        tag: 'div',
        styles: {
          color: 'white',
        },
        innerHtml: 'x' // TODO: icon
      },
      buttonBehaviours: Behaviour.derive([
        AddEventsBehaviour.config('button press', [
          AlloyEvents.run(NativeEvents.mouseover(), (comp, se) => { // Also focusin and focusout
            console.log('mouseover');
          }),
          AlloyEvents.run(NativeEvents.mouseout(), (comp, se) => {
            console.log('mouseout');
          }),
          AlloyEvents.preventDefault('click'),
          AlloyEvents.preventDefault('mousedown')
        ])
      ]),
      eventOrder: {
        click: [ 'button press', 'alloy.base.behaviour' ],
        mousedown: [ 'button press', 'alloy.base.behaviour' ]
      },
      action
    });

    const createColSegment = (table: SugarElement<HTMLTableElement>) => {
      const warehouse = Warehouse.fromTable(table);

      const isAllCellsSelectionHandleSelected = isFullySelectedTable(table);
      const allCellsSelectionHandle = Button.sketch({
        dom: {
          tag: 'div',
          classes: [ 'tox-table-rowcol-selection-handle' ],
          styles: {
            'border-radius': '3px 0 0 0',
          }
        },
        buttonBehaviours: Behaviour.derive([
          Toggling.config({
            toggleClass: 'tox-table-rowcol-selection-handle--active',
            aria: { mode: 'pressed' },
            selected: isAllCellsSelectionHandleSelected
          }),
        ]),
        components: isAllCellsSelectionHandleSelected ? [ renderChevronButton() ] : [],
        action: () => {
          const cells = Warehouse.justCells(Warehouse.fromTable(table));
          const cellElms = Arr.map(cells, (cell) => cell.element);
          if (cells.length > 0) {
            annotations.selectRange(table, cellElms, cellElms[0], cellElms[cellElms.length - 1]); // Wrong?
          }
          refreshTableOverlay(table);
        }
      });

      const optCols = Blocks.columns(warehouse);
      const colSegments = Arr.map(optCols, (optCol, colIndex) => {
        const isCurrentColSelected = isColSelected(table, colIndex);
        const isPrevColSelected = isColSelected(table, colIndex - 1);
        const isNextColSelected = isColSelected(table, colIndex + 1);
        return Button.sketch({
          dom: {
            tag: 'div',
            classes: [ 'tox-table-col-selection-handle' ],
            styles: {
              'border-top-left-radius': !isCurrentColSelected || isPrevColSelected ? '0' : '3px',
              'border-top-right-radius': !isCurrentColSelected || isNextColSelected ? '0' : '3px',
              'width': optCol.map((c) => Width.getOuter(c)).getOr(0) + 'px' // TODO:
            }
          },
          components: isCurrentColSelected && !isNextColSelected ? [ renderChevronButton() ] : [],
          buttonBehaviours: Behaviour.derive([
            Toggling.config({
              toggleClass: 'tox-table-col-selection-handle--active',
              aria: { mode: 'pressed' },
              selected: isCurrentColSelected,
            }),
          ]),
          action: () => {
            if (isColSelected(table, colIndex)) {
              annotations.clear(table);
            } else {
              const exts = Arr.filter(Obj.values(Warehouse.fromTable(table).access), (ext) => ext.column === colIndex);
              const tds = Arr.map(exts, (ext) => ext.element);
              if (tds.length > 0) {
                annotations.selectRange(table, tds, tds[0], tds[tds.length - 1]); // Wrong?
              }
            }
            refreshTableOverlay(table);
          }
        });
      });

      return Container.sketch({
        dom: {
          tag: 'div',
          styles: {
            'display': 'flex',
            'align-items': 'flex-end',
            'margin-left': isAllCellsSelectionHandleSelected ? '-14px' : '-11px', // temporary hack for anchoring layout
          }
        },
        components: [ allCellsSelectionHandle ].concat(colSegments),
      });
    };

    const createRowSegment = (table: SugarElement<HTMLTableElement>) => {
      const warehouse = Warehouse.fromTable(table);
      const optRows = Blocks.rows(warehouse);
      const rowSegments = Arr.map(optRows, (optRow, rowIndex) => {
        const isCurrentRowSelected = isRowSelected(table, rowIndex);
        const isPrevRowSelected = isRowSelected(table, rowIndex - 1);
        const isNextRowSelected = isRowSelected(table, rowIndex + 1);
        return Button.sketch({
          dom: {
            tag: 'div',
            classes: [ 'tox-table-row-selection-handle' ],
            styles: {
              'border-top-left-radius': !isCurrentRowSelected || isPrevRowSelected ? '0' : '3px',
              'border-bottom-left-radius': !isCurrentRowSelected || isNextRowSelected ? '0' : '3px',
              'height': optRow.map((r) => Height.getOuter(r)).getOr(0) + 'px' // TODO:
            },
          },
          components: isCurrentRowSelected && !isNextRowSelected ? [ renderChevronButton() ] : [],
          buttonBehaviours: Behaviour.derive([
            Toggling.config({
              toggleClass: 'tox-table-row-selection-handle--active',
              aria: { mode: 'pressed' },
              selected: isCurrentRowSelected
            })
          ]),
          action: () => {
            const exts = Arr.filter(Obj.values(Warehouse.fromTable(table).access), (ext) => ext.row === rowIndex);
            const tds = Arr.map(exts, (ext) => ext.element);
            if (tds.length > 0) {
              annotations.selectRange(table, tds, tds[0], tds[tds.length - 1]); // Wrong?
            }
            refreshTableOverlay(table);
          }
        });
      });

      return Container.sketch({
        dom: {
          tag: 'div',
          styles: {
            'display': 'flex',
            'flex-direction': 'column',
            'align-items': 'flex-end',
          }
        },
        components: rowSegments
      });
    };

    const refreshTableOverlay = (table: SugarElement) => {
      const warehouse = Warehouse.fromTable(table);

      InlineView.showAt(
        colSelectionComp,
        {
          anchor: 'node',
          root,
          node: Optional.some(table),
          overrides: {
            maxHeightFunction: MaxHeight.expandable(),
            // maxWidthFunction: MaxWidth.expandable()
          },
          layouts: {
            onRtl: () => [ Layout.north ],
            onLtr: () => [ Layout.north ]
          }
        },
        createColSegment(table)
      );

      InlineView.showAt(
        rowSelectionComp,
        {
          anchor: 'node',
          root,
          node: Optional.some(table),
          overrides: {
            // maxHeightFunction: MaxHeight.expandable(),
            maxWidthFunction: MaxWidth.expandable()
          },
          layouts: {
            onRtl: () => [ Layout.west ],
            onLtr: () => [ Layout.west ]
          }
        },
        createRowSegment(table)
      );

      const lastSelectedCellsInRows = Arr.foldl(warehouse.all, (acc, row) => {
        return Arr.find(Arr.reverse(row.cells), (cell) => isSelected(cell.element)).map((lastSelectedCellInRow) => {
          return [ ...acc, lastSelectedCellInRow.element ];
        }).getOr(acc);
      }, [] as SugarElement<HTMLElement>[]);

      Optionals.lift2(
        Arr.head(lastSelectedCellsInRows).map(Boxes.absolute),
        Arr.last(lastSelectedCellsInRows).map(Boxes.absolute),
        (topRightSelectedCell, bottomRightSelectedCell) => {
          if (hasSelectedCol(table)) { // Show nothing to the right, delete col x will display at the bottom
            InlineView.hide(cellSelectionComp); // TODO: make something smarter with all these .hide
            InlineView.hide(deleteRowButtonComp);
            return;
          } else if (hasSelectedRow(table)) {
            // Show deletion handle
            const kindOfHalfButtonHeight = 10; // TODO:
            InlineView.hide(cellSelectionComp);
            InlineView.showAt(
              deleteRowButtonComp,
              {
                anchor: 'makeshift',
                x: topRightSelectedCell.right,
                y: (topRightSelectedCell.y + bottomRightSelectedCell.bottom) / 2 - kindOfHalfButtonHeight,
              },
              Container.sketch({
                dom: {
                  tag: 'div',
                  classes: [ 'tox-table-cell-handle' ],
                  styles: {

                  }
                },
                components: [ renderDeleteButton(() => editor.execCommand('mceTableDeleteRow')) ]
              })
            );
          } else {
            // Show cell handle
            InlineView.hide(deleteRowButtonComp);
            InlineView.showAt(
              cellSelectionComp,
              {
                anchor: 'makeshift',
                x: topRightSelectedCell.right,
                y: topRightSelectedCell.y,
              },
              Container.sketch({
                dom: {
                  tag: 'div',
                  classes: [ 'tox-table-cell-handle' ],
                  styles: {
                    height: bottomRightSelectedCell.bottom - topRightSelectedCell.y + 'px',
                    // 'pointer-events': 'none',
                  }
                },
                components: [ renderChevronButton() ]
              })
            );
          }
        }
      ).fold(() => {
        InlineView.hide(cellSelectionComp);
        InlineView.hide(deleteRowButtonComp);
      }, Fun.noop);

      const lastSelectedCellsInLastRow = Arr.last(warehouse.all).map((lastRow) => {
        const cells = Arr.map(lastRow.cells, (cell) => cell.element);
        return Arr.filter(cells, isSelected);
      }).getOr([]);

      Optionals.lift2(
        Arr.head(lastSelectedCellsInLastRow).map(Boxes.absolute),
        Arr.last(lastSelectedCellsInLastRow).map(Boxes.absolute),
        (bottomLeftSelectedCell, bottomRightSelectedCell) => {
          const kindOfHalfButtonWidth = 10; // TODO:
          InlineView.showAt(
            deleteColButtonComp,
            {
              anchor: 'makeshift',
              x: (bottomLeftSelectedCell.x + bottomRightSelectedCell.right) / 2 - kindOfHalfButtonWidth,
              y: bottomLeftSelectedCell.bottom,
            },
            Container.sketch({
              dom: {
                tag: 'div',
                classes: [ 'tox-table-cell-handle' ],
                styles: {

                }
              },
              components: [ renderDeleteButton(() => editor.execCommand('mceTableDeleteCol')) ]
            })
          );
        }
      ).fold(() => {
        InlineView.hide(deleteColButtonComp);
      }, Fun.noop);
    };

    editor.on('ObjectSelected', (e) => {
      const selectedElm = SugarElement.fromDom(e.target);
      if (SugarNode.name(selectedElm) === 'table') {
        // Disable core resizing for tables
        e.preventDefault();
        refreshTableOverlay(selectedElm);
      }
    });

    // The delayed update causes the UI to "jump" when scrolling
    // const refresh = Throttler.first(() => {
    //   InlineView.reposition(colSelectionComp);
    //   InlineView.reposition(rowSelectionComp);
    // }, 0);
    const refresh = () => {
      InlineView.reposition(colSelectionComp);
      InlineView.reposition(rowSelectionComp);
      InlineView.reposition(cellSelectionComp); // TODO: see ContextToolbar.ts:148 for re-positioning

      // TODO: Makeshift anchors don't repositon
      InlineView.reposition(deleteRowButtonComp);
      InlineView.reposition(deleteColButtonComp);
    };

    editor.on('ScrollContent ResizeWindow', refresh);

    editor.on('TableSelectionChange', (e) => {
      const table = SelectorFind.ancestor<HTMLTableElement>(e.start, 'table').getOrDie(); // Assumes that there's only one table

      refreshTableOverlay(table);
    });
  });
};

export {
  setupTableUi
};
