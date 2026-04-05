export type DuplicateSelectionBehavior = 'ignore' | 'emit-event';

export type WordSearchScoringConfig = {
  pointsPerWord: number;
  pointsOnComplete: number;
};

export type WordSearchRules = {
  allowReverseSelection: boolean;
  duplicateSelectionBehavior: DuplicateSelectionBehavior;
  allowRevealWords: boolean;
};

export type CreateWordSearchGameOptions = {
  scoring?: Partial<WordSearchScoringConfig>;
  rules?: Partial<WordSearchRules>;
};

export type ResolvedWordSearchScoringConfig = WordSearchScoringConfig;

export type ResolvedWordSearchRules = WordSearchRules;
