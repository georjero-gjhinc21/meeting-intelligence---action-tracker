import { useUser } from '@clerk/clerk-react';
import { Position, VISIBILITY_MATRIX, getVisibilityRule } from '../config/visibility';

export function useUserPosition(): Position {
  const { user } = useUser();
  const metadataPosition = user?.publicMetadata?.executivePosition;

  if (typeof metadataPosition === 'string' && metadataPosition in VISIBILITY_MATRIX) {
    return metadataPosition as Position;
  }

  // Demo default: board member sees the full board rollup from the PPTX
  return 'Board Member';
}

export function useVisibilityRule() {
  const position = useUserPosition();
  return getVisibilityRule(position);
}
