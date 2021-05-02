export class GameExp<S, A> {
  constructor(public print: string, private f: (s: S) => A) {}

  map<B>(print: string, cb: (a: A, s: S) => B): GameExp<S, B> {
    return new GameExp<S, B>(`(${this.print} ${print})`, (s) => {
      const r = this.eval(s);
      const x = cb(r, s);
      return x;
    });
  }

  eval(state: S) {
    return this.f(state);
  }
}

export class GameAct<S> {
  constructor(public print: string, private f: (s: S) => void) {}

  then(act: GameAct<S>): GameAct<S> {
    return new GameAct<S>(this.print + " then " + act.print, (s) => {
      this.do(s);
      act.do(s);
    });
  }

  do(state: S) {
    this.f(state);
  }
}

type S = { a: number; b: number };

const a = new GameExp<S, number>("a", (s) => s.a);
const b = new GameExp<S, number>("b", (s) => s.b);

const test = a.map("+ 10", (v) => v + 10).map("+ b", (v, s) => v + b.eval(s));

console.log(test.eval({ a: 1, b: 5 }));
console.log(test.print);

const incrementA = (inc: number) => new GameAct<S>("inc A by " + inc, (s) => (s.a += inc));

const incAByExp = (inc: GameExp<S, number>) =>
  new GameAct<S>("inc A by " + inc.print, (s) => {
    s.a += inc.eval(s);
  });

type ActFact<S, A extends Parameters<any>> = {
  print: string;
  action: (...args: A) => GameAct<S>;
};

type X = Parameters<(a: number, b?: number) => void>;

type Y = ActFact<S, [4]>;

const fact1: ActFact<S, [number]> = {
  print: "increment a by x",
  action: (inc: number) => new GameAct<S>("inc A by " + inc, (s) => (s.a += inc)),
};

function mapExpToAction<T>(exp: GameExp<S, T>, fac: (v: T) => GameAct<S>): GameAct<S> {
  const actionExp = exp.map("?", (a, s) => fac(exp.eval(s)));
  return new GameAct<S>(actionExp.print, (s) => {
    const action = actionExp.eval(s);
    console.log(action.print);
    action.do(s);
  });
}

const s: S = { a: 1, b: 1 };
const act = incrementA(1).then(incrementA(2)).then(mapExpToAction(b, incrementA));

console.log(act.print);
act.do(s);

console.log(s);
