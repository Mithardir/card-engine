import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
} from "@mui/material";
import { useState } from "react";
import { Action } from "../engine/types";

export const ChooseMultipleDialog = (props: {
  title: string;
  choices: { title: string; image?: string | undefined; action: Action }[];
  onChoices: (actions: Action[]) => void;
}) => {
  const scale = 0.4;
  const width = 430 * scale;
  const height = 600 * scale;
  const [selected, setSelected] = useState<Action[]>([]);

  return (
    <Dialog open={true} maxWidth="md">
      <DialogTitle>{props.title}</DialogTitle>
      <DialogContent>
        <List
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-evenly",
          }}
        >
          {props.choices.map((o, i) => (
            <ListItem
              key={i}
              button={true}
              onClick={(e) => {
                e.stopPropagation();
                const filtered = selected.includes(o.action)
                  ? selected.filter((s) => s !== o.action)
                  : [...selected, o.action];

                setSelected(filtered);
              }}
              style={{ width: "auto" }}
            >
              <img
                alt={o.image}
                src={o.image}
                style={{
                  width,
                  height,
                  position: "relative",
                  opacity: selected.includes(o.action) ? 1 : 0.5,
                }}
              />
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            props.onChoices(selected);
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
