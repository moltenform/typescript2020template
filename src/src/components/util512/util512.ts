import _ from 'lodash';

export function add2Things(a: number, b: number) {
    try {
        //~ doSomethingElse()
    } catch (e) {
        checkTrue(e instanceof Error, 'should be an error');
        console.log(e.stack || '');
        console.log(JSON.stringify(e.stack) || '');
    }

    return _.sum([a, b]);
}

export function doSomethingElse() {
    const results: number[] = [];
    for (let i of _.range(1, 20)) {
        if (i % 9 === 4) {
            results.push(i);
        }
    }
    results.push(467);
    if (results.length > 0) {
        throw new Error('abcd');
    }
}

/**
 * a short way to say optional<T>.
 * prefer O<string> over ?string, I find it easier to read and reason about.
 */
export type O<T> = T | undefined;

//~ /**
//~ * this is a hard assert that always throws.
//~ */
export function checkTrue(
    condition: unknown,
    _s1: string,
    _s2?: unknown,
    _s3?: unknown
): asserts condition {
    if (!condition) {
        throw new Error('assertion failed');
        //~ if (!UI512ErrorHandling.silenceAssertMsgs) {
        //~ let msg = joinIntoMessage('assertTrue:', 'ui512', s1, s2, s3);
        //~ console.error(msg);
        //~ }

        //~ throw make512Error('assert:', s1, s2, s3).clsAsErr();
    }
}

/**
 * make the first character uppercase.
 */
function capitalizeFirst(s: string) {
    return s.substring(0, 1).toLocaleUpperCase() + s.substring(1);
}

export enum TestEnum {
    __isUI512Enum = 1,
    One = 1,
    Two = 2
}

export type TypeLikeAnEnum = {
    __isUI512Enum: number;
};

/**
 * string to enum.
 * accepts synonyms ("alternate forms") if enum contains __isUI512Enum
 */
export function findStrToEnum<T extends TypeLikeAnEnum>(Enm: T, s: string): O<T> {
    checkTrue(
        Enm['__isUI512Enum'] !== undefined,
        '4F|must provide an enum type with __isUI512Enum defined.'
    );
    if (s.startsWith('__')) {
        return undefined;
    } else if (s.startsWith('AlternateForm')) {
        return undefined;
    } else if (s.startsWith('__AlternateForm__')) {
        return undefined;
    } else {
        if ((Enm as any)['__UI512EnumCapitalize'] !== undefined) {
            s = capitalizeFirst(s);
        }

        let found = (Enm as any)[s];
        if (found) {
            return found;
        } else {
            return (Enm as any)['__AlternateForm__' + s];
        }
    }
}

let foundMethod = findStrToEnum(TestEnum, 'One');
let gotStr = findEnumToStr(TestEnum, 1);
console.log(foundMethod);
console.log(gotStr);

export type AnyUnshapedJson = any;
export type NoParameterCtor<T> = { new (): T };
export type AnyParameterCtor<T> = { new (...args: unknown[]): T };

/**
 * enum to string.
 * checks that the primary string is returned, not a synonym ('alternate form')
 */
export function findEnumToStr(Enm: any, n: number): O<string> {
    checkTrue(
        Enm['__isUI512Enum' as any] !== undefined,
        '4D|must provide an enum type with __isUI512Enum defined.'
    );

    /* using e[n] would work, but it's fragile if enum implementation changes. */
    for (let enumMember in Enm) {
        if (
            (Enm[enumMember as any] as unknown) === n &&
            !enumMember.startsWith('__') &&
            !enumMember.startsWith('__AlternateForm__')
        ) {
            let makeLowercase = Enm['__UI512EnumCapitalize' as any] !== undefined;
            return makeLowercase
                ? enumMember.toString().toLowerCase()
                : enumMember.toString();
        }
    }

    return undefined;
}
