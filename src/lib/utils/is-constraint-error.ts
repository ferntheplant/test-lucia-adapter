export const FK_VIOLATION_CODE = '23503';
export const UNIQUE_VIOLATION_CODE = '23505';

type CONSTRANT_CODES = typeof FK_VIOLATION_CODE | typeof UNIQUE_VIOLATION_CODE;

export function isConstraintError(err: unknown, code: CONSTRANT_CODES): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    typeof err.code === 'string' &&
    err.code === code
  );
}
