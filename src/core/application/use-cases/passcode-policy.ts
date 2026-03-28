export const MIN_PASSCODE_LENGTH = 8;
const MIN_UNIQUE_PASSCODE_CHARS = 4;
const blockedPasscodes = new Set([
  '12345678',
  '12345678a',
  '123456789',
  '87654321',
  '11111111',
  '00000000',
  'abcdefgh',
  'asdfghjk',
  'abc12345',
  'abc123456',
  'admin123',
  'changeme1',
  'default12',
  'dragon12',
  'iloveyou',
  'letmein1',
  'master12',
  'monkey12',
  'passw0rd',
  'password',
  'password1',
  'qazwsxed',
  'qwerty11',
  'qwerty1234',
  'qwerty123',
  'qwerty12',
  'trustno1',
  'wallet123',
  'welcome1',
  'zaq12wsx',
]);

export function validatePasscode(
  passcode: string,
) {
  if (passcode.length < MIN_PASSCODE_LENGTH) {
    throw new Error(
      `Passcode must contain at least ${MIN_PASSCODE_LENGTH} characters.`,
    );
  }

  if (!/\S/u.test(passcode)) {
    throw new Error(
      'Passcode cannot contain only spaces.',
    );
  }

  if (
    new Set(passcode).size <
    MIN_UNIQUE_PASSCODE_CHARS
  ) {
    throw new Error(
      `Passcode must contain at least ${MIN_UNIQUE_PASSCODE_CHARS} different characters.`,
    );
  }

  if (blockedPasscodes.has(passcode.toLowerCase())) {
    throw new Error(
      'Passcode is too common. Choose a less predictable one.',
    );
  }

  if (
    !/\p{L}/u.test(passcode) ||
    !/\d/u.test(passcode)
  ) {
    throw new Error(
      'Passcode must contain at least one letter and one digit.',
    );
  }
}
