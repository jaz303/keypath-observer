var kpo = require('../');
var test = require('tape');

test('simple observe/emit - depth 1', function(assert) {

	var tree = kpo();
	var x = false;

	tree.observe(['a'], function() { x = true; });
	tree.observe(['b'], function() { throw "nope"; });
	tree.observe(['c'], function() { throw "nope"; });

	tree.emit(['a'], 'notify');

	assert.equal(x, true);
	assert.end();

});

test('simple observe/emit - depth 3', function(assert) {

	var tree = kpo();
	var x = false;

	tree.observe(['a', 'b', 'c'], function() { x = true; });
	tree.observe(['a'], function() { throw "nope"; });
	tree.observe(['a', 'b', 'd'], function() { throw "nope"; });
	tree.observe(['a', 'd', 'e'], function() { throw "nope"; });

	tree.emit(['a', 'b', 'c'], 'notify');

	assert.equal(x, true);
	assert.end();

});

test('all observers fired', function(assert) {

	var tree = kpo();
	var x = 0;

	tree.observe(['a', 'b', 'c'], function() { x += 1; });
	tree.observe(['a', 'b', 'c'], function() { x += 2; });
	tree.observe(['a', 'b', 'c'], function() { x += 3; });

	tree.emit(['a', 'b', 'c'], 'notify');

	assert.equal(x, 6);
	assert.end();

});

test('context', function(assert) {
	var tree = kpo();
	var ctx = { x: 0 };
	tree.observe(['a'], function() { this.x++; }, ctx);
	tree.emit(['a'], 'notify');
	assert.equal(ctx.x, 1);
	assert.end();
});

test('removal', function(assert) {

	var tree = kpo();
	var x = 0;

	var r1 = tree.observe(['a', 'b', 'c'], function() { x += 1; });
	var r2 = tree.observe(['a', 'b', 'c'], function() { x += 2; });
	var r3 = tree.observe(['a', 'b', 'c'], function() { x += 3; });

	tree.emit(['a', 'b', 'c'], 'notify');
	assert.equal(x, 6);

	r1();

	tree.emit(['a', 'b', 'c'], 'notify');
	assert.equal(x, 11);

	r3();

	tree.emit(['a', 'b', 'c'], 'notify');
	assert.equal(x, 13);

	r2();

	tree.emit(['a', 'b', 'c'], 'notify');
	assert.equal(x, 13);

	assert.end();

});

test('wildcard - ?', function(assert) {

	var tree = kpo();
	var x = 0;

	tree.observe(['a', '?', 'c'], function() { x += 1; });
	tree.observe(['a', 'b', '?'], function() { x += 2; });
	tree.observe(['a', '?', '?'], function() { x += 3; });
	tree.observe(['a', '?'], function() { throw "boom"; });

	tree.emit(['a', 'b', 'c'], 'notify'); // +6
	tree.emit(['a', 'z', 'c'], 'notify'); // +4
	tree.emit(['a', 'b', 'z'], 'notify'); // +5

	assert.equal(x, 15);
	assert.end();

});

test('wildcard - *', function(assert) {

	var tree = kpo();
	var x = 0;

	tree.observe(['a', '*'], function() { x += 1; });

	tree.emit(['a'], 'notify');
	assert.equal(x, 0);

	tree.emit(['a', 'b'], 'notify');
	assert.equal(x, 1);

	tree.emit(['a', 'b', 'c'], 'notify');
	assert.equal(x, 2);

	tree.emit(['a', 'b', 'c', 'd'], 'notify');
	assert.equal(x, 3);

	assert.end();

});

test('events', function(assert) {

	var tree = kpo();
	var x = 0;

	tree.observe(['a', 'b', 'c'], 'change', function() { x += 1; });
	tree.observe(['a', 'b', 'c'], 'change', function() { x += 2; });
	tree.observe(['a', 'b', 'c'], '*', function() { x += 3; });
	tree.observe(['a', 'b', 'c'], 'foobar', function() { throw "boom"; });

	tree.emit(['a', 'b', 'c'], 'change');

	assert.equal(x, 6);
	assert.end();

});

test('events, hierarchical', function(assert) {

	var tree = kpo();
	var x = '';

	tree.observe(['a', 'b', 'c'], 'change', function() { x += 'a'; });
	tree.observe(['a', 'b', 'c'], 'change:update', function() { x += 'b'; });
	tree.observe(['a', 'b', 'c'], 'change:update:add', function() { x += 'c'; });
	tree.observe(['a', 'b', 'c'], 'change:bleem', function() { throw "boom"; });
	tree.observe(['a', 'b', 'c'], 'change:update:quux', function() { throw "boom"; });

	tree.emit(['a', 'b', 'c'], 'change:update:add');

	assert.equal(x, 'cba');
	assert.end();

});

test('arguments', function(assert) {

	var tree = kpo();
	var x = 0;

	tree.observe(['a', 'b'], function(a, b, c) { x = a + b + c; });
	tree.emit(['a', 'b'], 'notify', 1, 2, 3);

	assert.equal(x, 6);
	assert.end();

});