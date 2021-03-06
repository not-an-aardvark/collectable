import {assert} from 'chai';
import {Set as HashSet, fromArray, union, thaw, isThawed, size, isFrozen} from '../../src';
import {snapshot} from '../test-utils';

suite('[Set]', () => {
  const mainValues = ['A', 'B', 'C', 'D', 'E'];
  const otherValues = ['D', 'E', 'F', 'G'];
  const expectedValues = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  let main: HashSet<string>, mainSnapshot: object, result: HashSet<string>;

  suite('union(HashSet)', () => {
    let other: HashSet<string>, otherSnapshot: object;

    setup(() => {
      other = fromArray(otherValues);
      otherSnapshot = snapshot(other);
    });

    suite('when the main set is mutable', () => {
      setup(() => {
        main = thaw(fromArray(mainValues));
        mainSnapshot = snapshot(main);
        result = union(other, main);
      });

      test('the main set is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the main set is still mutable', () => {
        assert.isTrue(isThawed(result));
      });

      test('the other input set is not modified', () => {
        assert.deepEqual(snapshot(other), otherSnapshot);
      });

      test('the main set includes all items from both inputs', () => {
        assert.sameMembers(Array.from(result), expectedValues);
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the main set is immutable', () => {
      setup(() => {
        main = fromArray(mainValues);
        mainSnapshot = snapshot(main);
        result = union(other, main);
      });

      test('a new immutable set is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isFrozen(result));
      });

      test('the main set is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the other input set is not modified', () => {
        assert.deepEqual(snapshot(other), otherSnapshot);
      });

      test('the main set includes all items from both inputs', () => {
        assert.sameMembers(Array.from(result), expectedValues);
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });

  suite('union(Array)', () => {
    const other = otherValues.slice();

    suite('when the input set is mutable', () => {
      setup(() => {
        main = thaw(fromArray(mainValues));
        mainSnapshot = snapshot(main);
        result = union(other, main);
      });

      test('the input set is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the input set is still mutable', () => {
        assert.isTrue(isThawed(result));
      });

      test('the input array is not modified', () => {
        assert.deepEqual(other, otherValues);
      });

      test('the main set includes all items from both inputs', () => {
        assert.sameMembers(Array.from(result), expectedValues);
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the input set is immutable', () => {
      setup(() => {
        main = fromArray(mainValues);
        mainSnapshot = snapshot(main);
        result = union(other, main);
      });

      test('a new immutable set is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isFrozen(result));
      });

      test('the input set is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the input array is not modified', () => {
        assert.deepEqual(other, otherValues);
      });

      test('the main set includes all items from both inputs', () => {
        assert.sameMembers(Array.from(result), expectedValues);
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });

  suite('union(Iterable)', () => {
    let other: Iterable<string>;

    setup(() => {
      other = new Set(otherValues).values();
    });

    suite('when the input set is mutable', () => {
      setup(() => {
        main = thaw(fromArray(mainValues));
        mainSnapshot = snapshot(main);
        result = union(other, main);
      });

      test('the input set is returned', () => {
        assert.strictEqual(result, main);
      });

      test('the input set is still mutable', () => {
        assert.isTrue(isThawed(result));
      });

      test('the main set includes all items from both inputs', () => {
        assert.sameMembers(Array.from(result), expectedValues);
        assert.strictEqual(size(result), expectedValues.length);
      });
    });

    suite('when the input set is immutable', () => {
      setup(() => {
        main = fromArray(mainValues);
        mainSnapshot = snapshot(main);
        result = union(other, main);
      });

      test('a new immutable set is returned', () => {
        assert.notStrictEqual(result, main);
        assert.isTrue(isFrozen(result));
      });

      test('the input set is not modified', () => {
        assert.deepEqual(snapshot(main), mainSnapshot);
      });

      test('the main set includes all items from both inputs', () => {
        assert.sameMembers(Array.from(result), expectedValues);
        assert.strictEqual(size(result), expectedValues.length);
      });
    });
  });
});