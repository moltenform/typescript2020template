import { assert, describe, expect, test } from 'vitest'
import {add2Things} from '../src/components/util512/util512.ts';

function assertEq(a,b) {
    expect(a).toBe(b);
}

test('adds 1 + 2 to equal 3', () => {
    console.log('test this')
    expect(add2Things(1, 2)).toBe(3);
});

describe('add2Things', () => {
    test('adds 1 + 2 to equal 3', () => {
        //~ expect(add2Things(1, 2)).toBe(3);
        assertEq(3, add2Things(1, 2));
    });
});
