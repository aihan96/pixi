export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
  //max - min is the size of the range.
  //Multiplying Math.random() by that size gives a value from 0 up to (but not including) the range size.
  //Adding min shifts that value to start at min.
}
