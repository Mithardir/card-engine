import { State } from "../../types/state";
import { nextStep } from "./nextStep";

export function advanceToChoiceState(
  state: State,
  onError?: (error: string) => void
) {
  while (true) {
    if (state.choice) {
      if (state.choice.multi === false && state.choice.options.length === 1) {
        state.next.unshift(state.choice.options[0].action);
        state.choice = undefined;
      } else {
        return state;
      }
    }

    if (state.next.length === 0) {
      return;
    }

    try {
      nextStep(state);
    } catch (error) {
      if (onError) {
        onError(error.message);
      } else {
        throw error;
      }
    }
  }
}
