import { Fab, Icon } from "@mui/material";
import produce from "immer";
import { advanceToChoiceState } from "../engine/updates/advanceToChoiceState";
import { useGameState } from "./StateContext";

export const NextStepButton = (props: {
  setError: (error: string) => void;
}) => {
  const { state, setState } = useGameState();

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

          setState(newState);
        }}
      >
        <Icon>skip_next</Icon>
        {state.choice.title}
      </Fab>
    );
  }

  return null;
};
