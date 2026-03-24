import test from 'node:test';
import assert from 'node:assert/strict';
import { parseModelJson } from '../src/lib/genai.ts';

test('parseModelJson extracts JSON from explanatory text and code fences', () => {
  const text = `Here is your JSON:\n\n\`\`\`json\n{\n  "titleGroups": [\n    ["A", "B", "C"]\n  ]\n}\n\`\`\`\nThanks!`;

  const parsed = parseModelJson<{ titleGroups: string[][] }>(text);

  assert.deepEqual(parsed, {
    titleGroups: [['A', 'B', 'C']],
  });
});

test('parseModelJson tolerates trailing commas before closing brackets', () => {
  const text = `{\n  "titleGroups": [\n    ["A", "B", "C",],\n    ["D", "E", "F",],\n  ],\n}`;

  const parsed = parseModelJson<{ titleGroups: string[][] }>(text);

  assert.deepEqual(parsed, {
    titleGroups: [
      ['A', 'B', 'C'],
      ['D', 'E', 'F'],
    ],
  });
});
