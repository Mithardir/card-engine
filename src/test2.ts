export const a = 5;

export type NumberAlg<E> = {
  lit(v: number): E;
  add(a: E, b: E): E;
  sub(a: E, b: E): E;
  mul(a: E, b: E): E;
  div(a: E, b: E): E;
};

export type BoolAlg<E> = {
  lit(v: boolean): E;
  and(a: E, b: E): E;
  or(a: E, b: E): E;
  negate(a: E): E;
};

export type NumProp<P, NE> = {
  lit(name: string, value: number): P;
  inc(p: P, amount: NE): P;
};



export type AbilityAlg<AB, CM, AC, CA> = {
  modifySelf(text: string, mod: CM): AB;
  action(text: string, action: AC): AB;
  reaction<E>(text: string, event: E, condition: (event: E) => boolean, action: (event: E) => CA): AB;
};

export type CardAlg<C, CA, CM, AB> = {
  hero(name: string, att: number, def: number, ...abilities: AB[]): C;
  ally(name: string, cost: number, att: number, def: number, ...abilities: AB[]): C;

  addToken(token: "A" | "B"): CA;
  removeToken(token: "A" | "B"): CA;

  addMod(mod: CM): CA;

  sequence(...a: CA[]): CA;
};

export type PlayerAlg<P, PA> = {
  player(name: "A" | "B" | "C" | "D"): P;
  draw(amount: number): PA;

  sequence(...a: PA[]): PA;
};

export type GameAlg<GA, CA, PA, C, P> = {
  eachPlayer(pa: PA): GA;

  cardAction(card: C, ca: CA): GA;
  playerAction(player: P, ca: CA): GA;

  sequence(...a: GA[]): GA;
};

export type TestAlg<BE, NE> = {
  ifThen(cond: BE, t: NE, f: NE): NE;
};
