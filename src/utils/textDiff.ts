export type DiffSegment = {
  text: string;
  kind: 'same' | 'added' | 'removed';
};

function tokenize(text: string): string[] {
  return text.split(/(\s+)/).filter(part => part.length > 0);
}

/** Word-level diff for compare highlighting (original → improved). */
export function diffPhrases(original: string, improved: string): DiffSegment[] {
  const a = tokenize(original.trim());
  const b = tokenize(improved.trim());
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({length: m + 1}, () =>
    Array(n + 1).fill(0),
  );

  for (let i = m - 1; i >= 0; i -= 1) {
    for (let j = n - 1; j >= 0; j -= 1) {
      if (a[i] === b[j]) {
        dp[i][j] = dp[i + 1][j + 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  const segments: DiffSegment[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      segments.push({text: a[i], kind: 'same'});
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      segments.push({text: a[i], kind: 'removed'});
      i += 1;
    } else {
      segments.push({text: b[j], kind: 'added'});
      j += 1;
    }
  }
  while (i < m) {
    segments.push({text: a[i], kind: 'removed'});
    i += 1;
  }
  while (j < n) {
    segments.push({text: b[j], kind: 'added'});
    j += 1;
  }
  return segments;
}
