import test from 'node:test';
import assert from 'node:assert/strict';
import { getExploreTopicBatch, getExploreTopics } from './explore-topics';

test('getExploreTopics falls back to science topics for unknown domains', () => {
  assert.deepEqual(getExploreTopics('不存在').slice(0, 3), ['地球化学', '凝聚态物理', '物理前沿']);
});

test('getExploreTopicBatch returns the requested number of topics', () => {
  const topics = getExploreTopicBatch('科技', 0, 5);

  assert.equal(topics.length, 5);
  assert.deepEqual(topics, ['人机交互', '机器学习', '分布式系统', '产品架构', '数据可视化']);
});

test('getExploreTopicBatch rotates through the topic list', () => {
  const firstBatch = getExploreTopicBatch('历史', 0, 4);
  const secondBatch = getExploreTopicBatch('历史', 3, 4);

  assert.notDeepEqual(firstBatch, secondBatch);
  assert.deepEqual(secondBatch, ['帝国财政', '战争动员', '海洋史', '工业革命']);
});
