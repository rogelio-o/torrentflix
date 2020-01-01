const random = (mn, mx) => {
  return Math.random() * (mx - mn) + mn;
};

export const selectRandomly = (arr) => {
  if (arr.length === 0) {
    return undefined;
  } else {
    return arr[Math.floor(random(1, arr.length + 1)) - 1];
  }
};

export const range = (start, end) => {
  return Array(end - start + 1)
    .fill()
    .map((_, idx) => start + idx);
};
