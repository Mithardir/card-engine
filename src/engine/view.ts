import produce from "immer";
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
  players: PlayerState[];
  zones: Record<GameZoneType, ZoneState>;
  effects: Effect[];
  firstPlayer: PlayerId;
};

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

  const baseView: View = {
    ...baseState,
    cards: baseState.cards.map(createCardView),
  };

  const view = produce(baseView, (draft) => {
    while (true) {
      let allApplied = true;
      draft.cards.forEach((card) => {
        card.props.abilities
          .filter((a) => !a.applied)
          .forEach((ability) => {
            allApplied = false;
            ability.activate(draft, card.id);
            ability.applied = true;
          });
      });

      if (allApplied) {
        break;
      }
    }

    draft.effects.forEach((e) => {
      e.modifier(draft);
    });
  });

  //const end = new Date();

  //console.log("elapsed: ", end.valueOf() - begin.valueOf());

  return view;
}
