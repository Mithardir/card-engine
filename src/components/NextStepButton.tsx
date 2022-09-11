import { Fab, Icon } from "@mui/material";
import produce from "immer";
import { State } from "./test10";
import { advanceToChoiceState } from "./GameView";


export const NextStepButton = (props: {
  state: State;
  setState: (state: State) => void;
}) => {
  const state = props.state;
  if (state.choice && !state.choice.dialog) {
    return (
      <Fab
        color="primary"
        variant="extended"
        style={{ position: "fixed", right: 8, bottom: 8 }}
        onClick={() => {
          const newState = produce(state, (draft) => {
            draft.choice = undefined;
            advanceToChoiceState(draft);
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
