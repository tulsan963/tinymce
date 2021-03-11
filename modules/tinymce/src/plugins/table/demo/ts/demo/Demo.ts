declare let tinymce: any;

const settings = {
  selector: 'div.tinymce',
  plugins: 'table code searchreplace',
  toolbar: 'table tableprops tablecellprops tablerowprops | tabledelete | tableinsertrowbefore tableinsertrowafter tabledeleterow | tableinsertcolbefore tableinsertcolafter tabledeletecol | tablecutrow tablecopyrow tablepasterowbefore tablepasterowafter',
  media_dimensions: false,
  table_class_list: [
    { title: 'None', value: '' },
    { title: 'Dog', value: 'dog' },
    { title: 'Cat', value: 'cat' }
  ],
  table_row_class_list: [
    { title: 'None', value: '' },
    { title: 'Fish', value: 'fish' },
    { title: 'Mouse', value: 'mouse' }
  ],
  table_cell_class_list: [
    { title: 'None', value: '' },
    { title: 'Bird', value: 'bird' },
    { title: 'Snake', value: 'snake' }
  ],
  table_style_by_css: true,
  // table grid TBD
  table_grid: true,
  // table_column_resizing: 'preservetable',
  // table_sizing_mode: 'fixed',
  // table_advtab: true,
  // table_cell_advtab: false,
  // table_row_advtab: false,
  // media_live_embeds: false,
  // media_url_resolver: function (data, resolve) {
  // resolve({
  //   html: '<iframe src="' + data.url + '" width="560" height="314" allowfullscreen="allowfullscreen"></iframe>'});
  // },
  // height: 1600,
  height: 700,
  // content_style: 'td[data-mce-selected], th[data-mce-selected] { background-color: #2276d2 !important; }' + '.cat { border-color: green; color: red; background-color: }'
  // content_style: 'table { border-collapse: unset !important; }'
  content_style: 'body { padding: 30px; }'
};

tinymce.init(settings);
tinymce.init({ ...settings, selector: 'div.tinymce-inline', inline: true });

export {};
