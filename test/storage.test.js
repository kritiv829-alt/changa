import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTasks, saveTasks } from '../storage.js';

function mockStorage(t, storage) {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  t.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  });
}

test('new storage is empty and saved tasks survive reload', t => {
  const data = new Map();
  mockStorage(t, { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) });
  assert.deepEqual(loadTasks(), { tasks: [], error: false });
  const tasks = [{ id: 'one', title: 'Buy milk', completed: false }];
  assert.equal(saveTasks(tasks), true);
  assert.deepEqual(loadTasks(), { tasks, error: false });
  assert.equal(saveTasks([]), true);
  assert.deepEqual(loadTasks(), { tasks: [], error: false });
});

test('malformed JSON and non-array data return a warning without throwing', t => {
  let raw;
  mockStorage(t, { getItem: () => raw });
  for (raw of ['{', 'null', '{}', '42']) {
    assert.deepEqual(loadTasks(), { tasks: [], error: true });
  }
});

test('recovers valid entries and rejects invalid or duplicate tasks without rewriting storage', t => {
  const valid = { id: 'one', title: 'Read', completed: true };
  mockStorage(t, { getItem: () => JSON.stringify([
    valid, valid, null, { id: 'two', title: ' ', completed: false },
    { id: 'three', title: 'Read', completed: 'yes' },
    { id: 'four', title: 'x'.repeat(201), completed: false },
    { id: '', title: 'Read', completed: false },
  ]), setItem: () => assert.fail('Loading must not overwrite stored data') });
  assert.deepEqual(loadTasks(), { tasks: [valid], error: true });
});

test('storage access and quota failures do not escape to the app', t => {
  mockStorage(t, {
    getItem() { throw new Error('Access denied'); },
    setItem() { throw new Error('Quota exceeded'); },
  });
  assert.deepEqual(loadTasks(), { tasks: [], error: true });
  assert.equal(saveTasks([]), false);
});
