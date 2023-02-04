import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItem,
} from "@mui/material";
import { useEffect } from "react";
import { Action } from "../types/actions";

export const ChooseSingleDialog = (props: {
  title: string;
  choices: { title: string; image?: string | undefined; action: Action }[];
  onChoice: (action: Action) => void;
}) => {
  const scale = 0.4;
  const width = 430 * scale;
  const height = 600 * scale;

  useEffect(() => {
    if (props.choices.length === 1) {
      props.onChoice(props.choices[0].action);
    }
  });

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
          {props.choices.map((a, i) => (
            <Grid key={i} item xs={!a.image ? 12 : "auto"}>
              <ListItem
                button
                key={a.title}
                onClick={() => {
                  props.onChoice(a.action);
                }}
                style={{ width: "auto" }}
              >
                {a.image ? (
                  <img
                    alt={a.image}
                    src={a.image}
                    style={{
                      width,
                      height,
                      position: "relative",
                    }}
                  />
                ) : (
                  a.title
                )}
              </ListItem>
            </Grid>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};
