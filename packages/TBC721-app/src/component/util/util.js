// contain same elements
export function areEqual(oldRevs, newRevs) {
  let n = oldRevs.length;
  let m = newRevs.length;

  if (n !== m) return false;

  let map = new Map();
  let count = 0;
  for (let i = 0; i < n; i++) {
    if (!map.get(oldRevs[i])) {
      map.set(oldRevs[i], 1);
    } else {
      count = map.get(oldRevs[i]);
      count++;
      map.set(oldRevs[i], count);
    }
  }
  for (let i = 0; i < n; i++) {
    if (!map.has(newRevs[i])) return false;

    if (map.get(newRevs[i]) === 0) return false;

    count = map.get(newRevs[i]);
    --count;
    map.set(newRevs[i], count);
  }

  return true;
}
