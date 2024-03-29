export function shuffleArray<T>(a: T[], order?: number[]) {
  const newOrder: number[] = [];
  for (let i = a.length - 1; i > 0; i--) {
    const j = order
      ? order[a.length - 1 - i]
      : Math.floor(Math.random() * (i + 1));
    newOrder.push(j);
    [a[i], a[j]] = [a[j], a[i]];
  }

  return order ? order : newOrder;
}
