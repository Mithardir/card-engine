import { PrintedProps } from "./types";
import {
  CardId,
  CardState,
  Effect,
  GameZoneType,
  Marks,
  Phase,
  PlayerId,
  PlayerState,
  Side,
  State,
  Tokens,
  ZoneState,
} from "./state";
import { Action } from "./actions/types";
import { toJS } from "mobx";

export type View = {
  phase: Phase;
  cards: CardView[];
  players: Partial<Record<PlayerId, PlayerState>>;
  zones: Record<GameZoneType, ZoneState>;
  effects: Effect[];
  responses: Responses;
  firstPlayer: PlayerId;
};

export interface Response<T> {
  description: string;
  condition: (e: T, view: View) => boolean;
  action: (e: T) => Action;
}

export interface Responses {
  receivedDamage: Array<Response<{ cardId: CardId; amount: number }>>;
  destroyed: Array<Response<{ cardId: CardId; attackers: CardId[] }>>;
  revealed: Array<Response<{ cardId: CardId }>>;
  leavedPlay: Array<Response<{ cardId: CardId }>>;
  enteredPlay: Array<Response<{ cardId: CardId; playerId: PlayerId }>>;
  declaredAsDefender: Array<Response<{ attacker: CardId; defender: CardId }>>;
  afterTravel: Array<Response<{ cardId: CardId }>>;
  afterEnemyEngages: Array<Response<{ enemy: CardId; player: PlayerId }>>;
  afterEnemyAttacks: Array<Response<{ attacker: CardId }>>;
  whenEnemyAttacks: Array<Response<{ attacker: CardId }>>;
}

export type CardProps = Omit<PrintedProps, "abilities"> & {
  abilities: AbilityView[];
};

export type CardView = {
  id: CardId;
  printed: Readonly<PrintedProps>;
  props: CardProps;
  tapped: boolean;
  sideUp: Side;
  token: Tokens;
  mark: Marks;
  actions: Array<{ description: string; effect: Action }>;
  setup?: Action;
  attachedTo?: CardId;
};

export type AbilityView = {
  description: string;
  implicit: boolean;
  activate: (view: View, self: CardId) => void;
  applied: boolean;
};

export function createCardView(state: CardState): CardView {
  const printed = state.definition[state.sideUp];
  const props = {
    ...printed,
    abilities: printed.abilities.map((a) => ({ ...a, applied: false })),
  };
  const actions: CardView["actions"] = [];
  return { ...state, printed, props, actions };
}

export function createView(state: State) {
  //const begin = new Date();

  const baseState = toJS(state);

  const view: View = {
    ...baseState,
    cards: baseState.cards.map(createCardView),
    responses: {
      afterEnemyAttacks: [],
      afterEnemyEngages: [],
      afterTravel: [],
      declaredAsDefender: [],
      destroyed: [],
      enteredPlay: [],
      leavedPlay: [],
      receivedDamage: [],
      revealed: [],
      whenEnemyAttacks: [],
    },
  };

  while (true) {
    let allApplied = true;
    view.cards.forEach((card) => {
      card.props.abilities
        .filter((a) => !a.applied)
        .forEach((ability) => {
          allApplied = false;
          ability.activate(view, card.id);
          ability.applied = true;
        });
    });

    if (allApplied) {
      break;
    }
  }

  view.effects.forEach((e) => {
    e.modifier(view);
  });

  //const end = new Date();

  //console.log("elapsed: ", end.valueOf() - begin.valueOf());

  return view;
}
