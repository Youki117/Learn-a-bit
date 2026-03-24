const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string) {
  return emailPattern.test(email.trim());
}

export function getFriendlyAuthErrorMessage(message: string) {
  if (message === 'Invalid login credentials') {
    return '邮箱或密码不正确';
  }

  return message;
}
