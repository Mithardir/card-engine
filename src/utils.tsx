export interface Flavoring<FlavorT> {
  _type?: FlavorT;
}

export type Flavor<T, FlavorT> = T & Flavoring<FlavorT>;

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getUniqueId(id: string, exist: (id: string) => boolean) {
  if (exist(id)) {
    let i = 2;
    while (true) {
      const newId = id + "_" + i;
      if (!exist(newId)) {
        return newId;
      }
      i++;
    }
  } else {
    return id;
  }
}

export function shuffleArray<T>(a: T[], order?: number[]) {
  const newOrder: number[] = [];
  for (let i = a.length - 1; i > 0; i--) {
    const j = order ? order[a.length - 1 - i] : Math.floor(Math.random() * (i + 1));
    newOrder.push(j);
    [a[i], a[j]] = [a[j], a[i]];
  }

  return order ? order : newOrder;
}
