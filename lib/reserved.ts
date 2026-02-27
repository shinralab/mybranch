export const RESERVED_BRANCHES = new Set([
  
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



  return (
    RESERVED_BRANCHES.has(normalized) ||

  );
}
