export function validatePassword(password: string): { ok: true } | { ok: false; error: string } {
  if (typeof password !== 'string' || password.length < 8) {
    return { ok: false, error: 'Le mot de passe doit contenir au moins 8 caractères.' };
  }
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
    return { ok: false, error: 'Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial.' };
  }
  return { ok: true };
}
