/* global describe, it, beforeEach, assert, renderNodes */

describe('rendering HTML', function () {

  beforeEach(function () {
    while( document.body.firstChild ) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it('render div', function () {

    var html_nodes = [{ $:'div', attrs: { 'class': 'foo-bar' }, _: 'foobar' }];

    renderNodes(document.body, html_nodes);

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div>' );

    renderNodes(document.body, html_nodes);

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div>' );

  });

  it('render svg', function () {

    var html_nodes = [{ $:'div', attrs: { 'class': 'foo-bar' }, _: [
      { $:'svg', attrs: { height: '100', width: '100' }, _: [
        { $: 'circle', attrs: { cx: '50', cy: '50', r: '40', stroke: 'black', 'stroke-width': '3', fill: 'red' } }
      ] }
    ] }];

    renderNodes(document.body, html_nodes);

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar"><svg height="100" width="100"><circle cx="50" cy="50" r="40" stroke="black" stroke-width="3" fill="red"></circle></svg></div>' );

  });

  it('render function attributes', function () {

    renderNodes(document.body, [{ $:'div', attrs: { 'class': function () { return 'foo-bar'; } }, _: 'foobar' }]);

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div>' );

    renderNodes(document.body, [{ $:'div', attrs: { 'class': () => 'foo-bar' }, _: 'foobar' }]);

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div>' );

  });

  it('rendering text nodes', function () {

    renderNodes(document.body, [{ $:'div', attrs: { 'class': function () { return 'foo-bar'; } }, _: [{ text: 'foobar' }] }]);

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div>' );

  });

  it('withNode', function () {

    var html_nodes = [{ $:'div', attrs: { 'class': 'foo-bar' }, _: 'foobar' }, { $:'div', attrs: { 'data-if': ' foo === bar ' }, _: 'foobar' }];

    renderNodes(document.body, html_nodes, {
      withNode: function (node) {
        if( node.attrs && 'data-if' in node.attrs ) return {
          replace_by_comment: ' data-if replaced by comment '
        };
      },
    });

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div><!-- data-if replaced by comment -->' );

  });

  it('initNode', function () {

    var html_nodes = [{ $:'div', attrs: { 'class': 'foo-bar' }, _: 'foobar' }, { $:'div', attrs: { 'data-if': ' foo === bar ' }, _: 'foobar' }],
        matched_node;

    renderNodes(document.body, html_nodes, {
      withNode: function (node) {
        if( node.attrs && 'data-if' in node.attrs ) return {
          initNode: function (node_el) {
            matched_node = node_el;
          },
        };
      },
    });

    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div><div data-if=" foo === bar ">foobar</div>' );
    assert.strictEqual( matched_node.nodeName, 'DIV' );
    assert.strictEqual( matched_node.getAttribute('data-if'), ' foo === bar ' );

  });

  it('insert_before', function () {

    var html_nodes = [{ $:'div', attrs: { 'class': 'foo-bar' }, _: 'foobar' }, { $:'div', attrs: { 'insert-before': ' me ' }, _: 'foobar' }],
        append_nodes = [{ $:'foo-bar' }, { $:'bar-foo', attrs: { 'foo': 'bar' }, _: ' text content ' }],
        insert_before;

    renderNodes(document.body, html_nodes, {
      withNode: function (node) {
        if( node.attrs && node.attrs['insert-before'] === ' me ' ) return {
          initNode: function (node_el) {
            insert_before = node_el;
          },
        };
      },
    });

    renderNodes(document.body, append_nodes, {
      insert_before: insert_before,
    });

    assert.strictEqual( insert_before.nodeName, 'DIV' );
    assert.strictEqual( insert_before.getAttribute('insert-before'), ' me ' );
    assert.strictEqual( document.body.innerHTML, '<div class="foo-bar">foobar</div><foo-bar></foo-bar><bar-foo foo="bar"> text content </bar-foo><div insert-before=" me ">foobar</div>' );

  });

});
