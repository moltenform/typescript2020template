
/* auto */ import { Util512Higher } from './../util/util512Higher';
/* auto */ import { assertTrue } from './../util/util512Assert';
/* auto */ import { Util512, assertEq, wrapTypedJson } from './../util/util512';
/* auto */ import { SimpleUtil512TestCollection, assertThrows, assertThrowsAsync } from './testUtils';
import  'reflect-metadata';
import { jsonObject, jsonMember, TypedJSON } from 'typedjson';
import { O } from '../util/util512Base';


let t = new SimpleUtil512TestCollection('testUtilsSerialize');
export let testCollectionUtilsSerialize = t;

@jsonObject
class DemoSerializable {
        __private = 'not serialized';

        @jsonMember
        fld1 = 'fld 1';

        @jsonMember
        fld2 = 'fld 2 and text';

        @jsonMember
        optional_f1: O<string> = 'an optional field';

        @jsonMember
        optional_f2: O<string> = 'also optional';
 }

t.test('basicSerialize', () => {
    const objSent = new DemoSerializable()
    const serializer = new TypedJSON(DemoSerializable);
    const json = serializer.stringify(objSent);
    const objectGot = wrapTypedJson(DemoSerializable, json);
    //~ console.log('aaa')
    throw new Error('finish this')
})
