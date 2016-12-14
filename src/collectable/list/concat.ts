import {CONST, COMMIT_MODE, OFFSET_ANCHOR, nextId, isDefined, concatToNewArray, concatSlotsToNewArray, log, publish} from './common';
import {TreeWorker} from './traversal';
import {compact} from './compact';
import {Slot} from './slot';
import {View} from './view';
import {ListState} from './state';

export function concat<T>(leftState: ListState<T>, rightState: ListState<T>): ListState<T> {
  if(leftState.size === 0) {
    return rightState;
  }

  if(rightState.size === 0) {
    return leftState;
  }

  // Ensure that the right list has the same group as the left list and that if they are references to the same list,
  // that the right list is first cloned to avoid ghosted changes between different nodes, and that both lists are
  // working within the same group context.
  if((leftState === rightState && (leftState.group = nextId())) || rightState.group !== leftState.group) {
    rightState = rightState.clone(leftState.group, true);
  }

log(`left state id: ${leftState.id}, group: ${leftState.group}, right state id: ${rightState.id}, group: ${rightState.group}`);

  var left = TreeWorker.defaultPrimary<T>().reset(leftState, TreeWorker.focusTail<T>(leftState, true), leftState.group, COMMIT_MODE.RELEASE);
  var right = TreeWorker.defaultSecondary<T>().reset(rightState, TreeWorker.focusHead(rightState, true), leftState.group, COMMIT_MODE.RELEASE);

  if(left.current.slot.group !== left.group) {
    left.current = left.current.ensureEditable(leftState.group, true);
    leftState.setView(left.current);
  }

  if(right.current.slot.group !== right.group) {
    right.current = right.current.ensureEditable(rightState.group, true);
    rightState.setView(right.current);
  }

  var group = leftState.group,
      leftIsRoot = left.isRoot(),
      rightIsRoot = right.isRoot(),
      hasLeftOuterView = left.hasOtherView(),
      hasRightOuterView = right.hasOtherView(),
      isJoined = false;

publish([leftState, rightState], false, `concatenation initialization start; group: ${leftState.group}, has left outer view: ${hasLeftOuterView}, has right outer view: ${hasRightOuterView}`);

  var nodes: [Slot<T>, Slot<T>] = [left.current.slot, right.current.slot];

  var xx = 0;
  do {
publish([leftState, rightState], false, `[LOOP START | CONCAT | iteration #${xx}] left is root: ${leftIsRoot}, right is root: ${rightIsRoot}`);

    if(++xx === 10) {
      throw new Error('Infinite loop (concat)');
    }

    if(left.current.anchor === OFFSET_ANCHOR.RIGHT) {
      left.current.flipAnchor(leftState.size);
    }
    if(right.current.anchor === OFFSET_ANCHOR.RIGHT) {
      right.current.flipAnchor(rightState.size);
    }

    var rightSlotCount = right.current.slotCount();
    var rightSize = right.current.slot.size;

    // If join() returns true, it means that, at the very least, some slots were shuffled from right to left. If the
    // right slot in the nodes array has size zero after the operation, then the right slot has been fully merged into
    // the left slot and can be eliminated.
    if(join(nodes, left.shift, leftIsRoot || rightIsRoot, [leftState, rightState])) {
log(`left seam: ${left.current.id}, right seam: ${right.current.id}`);
publish([leftState, rightState], false, `joined left and right: ${nodes[1].size === 0 ? 'TOTAL' : 'PARTIAL'}`);
      var slotCountDelta = rightSlotCount - nodes[1].slots.length;
      var slotSizeDelta = rightSize - nodes[1].size;

      isJoined = (leftIsRoot || rightIsRoot) && nodes[1].slots.length === 0;
      left.current.replaceSlot(nodes[0]);

      if(!isJoined || !left.isRoot()) {
        left.current.slotsDelta += slotCountDelta;
        left.current.sizeDelta += slotSizeDelta;
      }

      if(isJoined) {
        if(!rightIsRoot) {
log(`right is not root`);
          if(right.current.slot.isReserved()) {
            left.current.slot.group = -group;
          }
          left.current.xparent = right.current.xparent;
          left.current.recalculateDeltas();
        }
        if(!right.otherCommittedChild.isNone()) {
log(`joined with right committed child; slotCountDelta: ${slotCountDelta}, left.current.slotCount: ${left.current.slotCount()}`);
          right.otherCommittedChild.xslotIndex += left.current.slotCount() - slotCountDelta;
          right.otherCommittedChild.xparent = left.current;
        }
        if(left.shift > 0) {
log(`left is not leaf level`);
          right.previous.xslotIndex += slotCountDelta;
          right.previous.xparent = left.current;
          right.previous.recalculateDeltas();
        }
      }
      else {
log(`replace left slot of right list`);
        right.current.replaceSlot(nodes[1]);
        right.current.sizeDelta -= slotSizeDelta;
        right.current.slotsDelta -= slotCountDelta;
      }
    }

    if(!isJoined) {
publish([leftState, rightState], false, `ready to ascend views ${left.current.id} and ${right.current.id} to the next level (group: ${leftState.group})`);
      left.ascend(COMMIT_MODE.RELEASE);
publish([leftState, rightState], false, `left ascended`);

      if(left.shift === CONST.BRANCH_INDEX_BITCOUNT) {
        left.previous.flipAnchor(leftState.size + rightState.size);
      }

      right.ascend(COMMIT_MODE.RELEASE);
publish([leftState, rightState], false, `right ascended`);

      if(!leftIsRoot) {
        leftIsRoot = left.current.isRoot();
      }
      if(!rightIsRoot) rightIsRoot = right.current.isRoot();

      nodes[0] = left.current.slot;
      nodes[1] = right.current.slot;

    }
  } while(!isJoined);

  leftState.size += rightState.size;

  if(right.hasOtherView()) {
    if(!left.hasOtherView()) {
      if(leftState.right.anchor !== OFFSET_ANCHOR.LEFT) {
        leftState.right.flipAnchor(leftState.size);
      }
      leftState.setView(leftState.right);
    }
log(`right.other.slot.size: ${right.other.slot.size}, anchor: ${right.other.anchor}`);
log(`left state; left view: ${leftState.left.id}, right view: ${leftState.right.id}`);
publish([leftState, rightState], false, `concat: pre-assign right view`);
    if(right.other.slot.size > 0) {
      leftState.setView(right.other);
publish(leftState, false, `concat: post-assign right view`);
    }
    else {
      right.other.disposeIfInGroup(rightState.group, leftState.group);
      leftState.setView(View.empty<T>(OFFSET_ANCHOR.RIGHT));
    }
  }

  leftState.lastWrite = leftState.right.slot.isReserved() || leftState.left.isNone() ? OFFSET_ANCHOR.RIGHT : OFFSET_ANCHOR.LEFT;

publish(leftState, true, `concat done`);

  left.dispose();
  right.dispose();

  return leftState;
}

export function join<T>(nodes: [Slot<T>, Slot<T>], shift: number, canFinalizeJoin: boolean, lists?: any): boolean {
  var left = nodes[0], right = nodes[1];
  var count = left.slots.length + right.slots.length;

  if(canFinalizeJoin && count <= CONST.BRANCH_FACTOR) {
    var relaxed = left.isRelaxed() || right.isRelaxed() || !left.isSubtreeFull(shift);

    // TODO: don't allocate new arrays if the slots already have the correct group
    left.slots = shift === 0
      ? concatToNewArray(left.slots, right.slots, 0)
      : concatSlotsToNewArray<T>(<Slot<T>[]>left.slots, <Slot<T>[]>right.slots);
    left.size += right.size;
    left.subcount += right.subcount;
    left.recompute = relaxed ? 0 : -1;
    nodes[1] = Slot.empty<T>();
    return true;
  }

  if(shift === 0) {
    return false;
  }

  var reducedCount = calculateRebalancedSlotCount(count, left.subcount + right.subcount);
  if(count === reducedCount) {
    return false;
  }

  compact([left, right], shift, count - reducedCount, lists);
  return true;
}

export function calculateExtraSearchSteps(upperSlots: number, lowerSlots: number): number {
  var steps =  upperSlots - (((lowerSlots - 1) >>> CONST.BRANCH_INDEX_BITCOUNT) + 1);
  return steps;
}

export function calculateRebalancedSlotCount(upperSlots: number, lowerSlots: number): number {
  var reduction = calculateExtraSearchSteps(upperSlots, lowerSlots) - CONST.MAX_OFFSET_ERROR;
  return upperSlots - (reduction > 0 ? reduction : 0);
}