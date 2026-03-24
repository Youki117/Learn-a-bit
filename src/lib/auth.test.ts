import test from 'node:test';
import assert from 'node:assert/strict';
import { getFriendlyAuthErrorMessage, isValidEmail } from './auth';

test('isValidEmail accepts a normal email address', () => {
  assert.equal(isValidEmail('learner@example.com'), true);
});

test('isValidEmail rejects malformed email addresses', () => {
  assert.equal(isValidEmail('learnerexample.com'), false);
  assert.equal(isValidEmail(''), false);
});

test('getFriendlyAuthErrorMessage rewrites invalid login credentials', () => {
  assert.equal(getFriendlyAuthErrorMessage('Invalid login credentials'), '邮箱或密码不正确');
});

test('getFriendlyAuthErrorMessage falls back to the original message', () => {
  assert.equal(getFriendlyAuthErrorMessage('Email not confirmed'), 'Email not confirmed');
});
