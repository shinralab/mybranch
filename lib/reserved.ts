export const RESERVED_BRANCHES = new Set([
  'mfdoge',
  'mf-doge',
  'mf_doge',
  'mfdogex',
  'mfdoge69',
]);

/**
 * Checks if a branch name is reserved to prevent impersonation.
 * Matching is case-insensitive and ignores separators.
 */
export function isReservedBranch(branch: string | undefined): boolean {
  if (!branch) {
    return false;
  }

  const normalized = branch
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

  return (
    RESERVED_BRANCHES.has(normalized) ||
    normalized.startsWith('mfdoge') ||
    normalized.includes('mfdoge')
  );
}
