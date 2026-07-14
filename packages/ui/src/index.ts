export interface EmptyStateCopy {
  readonly title: string;
  readonly description: string;
}

export function buildEmptyState(copy: EmptyStateCopy): EmptyStateCopy {
  return copy;
}
