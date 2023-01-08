import { Fab, Icon } from "@mui/material";
import produce from "immer";
import { State } from "../types/state";
import { advanceToChoiceState } from "../engine/basic";

export const NextStepButton = (props: {
  state: State;
  setState: (state: State) => void;
  setError: (error: string) => void;
}) => {
  const state = props.state;

  // useEffect(() => {
  //   if (
  //     state.choice &&
  //     !state.choice.dialog &&
  //     state.choice?.options.length === 0
  //   ) {
  //     const newState = produce(state, (draft) => {
  //       draft.choice = undefined;
  //       advanceToChoiceState(draft);
  //     });

  //     props.setState(newState);
  //   }
  // });

  if (state.choice && !state.choice.dialog) {
    return (
      <Fab
        color="primary"
        variant="extended"
        style={{ position: "fixed", right: 8, bottom: 8 }}
        onClick={() => {
          const newState = produce(state, (draft) => {
            draft.choice = undefined;
            advanceToChoiceState(draft, props.setError);
          });

          props.setState(newState);
        }}
      >
        <Icon>skip_next</Icon>
        {state.choice.title}
      </Fab>
    );
  }

  return null;
};
