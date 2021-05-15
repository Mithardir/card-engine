import { State } from "../state";
import { sequence } from "./control";
import { Action, ActionResult } from "./types";
import { sample } from "lodash";

export function checkEndCondition(state: State): "win" | "loose" | undefined {
  // TODO all checks
  if (state.players.some((p) => p.thread >= 50)) {
    return "loose";
  }

  if (state.players.some((p) => p.zones.playerArea.cards.length === 0)) {
    return "loose";
  }

  if (state.cards.some((c) => c.token.progress > 5)) {
    return "win";
  }
}

export function playRandomlyUntilEnd(state: State, action: Action): "win" | "loose" {
  let result: ActionResult;
  try {
    result = action.do(state);
  } catch (error) {
    action.do(state);
    throw error;
  }
  const end = checkEndCondition(state);
  if (end) {
    return end;
  }

  if (!result.choice) {
    if (!result.next) {
      debugger;
      throw new Error("out of options");
    } else {
      return playRandomlyUntilEnd(state, result.next);
    }
  } else {
    const choosen = sample(result.choice.choices)!;
    //console.log(result.choice.title, choosen.label);
    return playRandomlyUntilEnd(state, result.next ? sequence(choosen.action, result.next) : choosen.action);
  }
}

// export function getStateTree(state: State, action: Action): StateTree {
//   const result = action.do(state);

//   const end = checkEndCondition(state);
//   if (end) {
//     return {
//       state,
//       next: undefined,
//     };
//   }

//   if (!result.choice) {
//     if (!result.next) {
//       return {
//         state: result.state,
//         next: undefined,
//       };
//     } else {
//       return getStateTree(result.state, result.next);
//     }
//   } else {
//     return {
//       state: result.state,
//       next: {
//         title: result.choice.title,
//         choices: result.choice.choices.map((c) => {
//           return {
//             label: c.label,
//             get result() {
//               const next = result.next ? result.next : sequence();
//               return getStateTree(result.state, sequence(c.action, next));
//             },
//           };
//         }),
//       },
//     };
//   }
// }

export function noChange(state: State): ActionResult {
  return {
    choice: undefined,
    next: undefined,
  };
}
