import React, { PropsWithChildren, useState } from "react";

export type DialogComponent<T = {}> = React.FunctionComponent<DialogProps<T>>;

export type DialogsContextProps = {
  openDialog: <T>(props: DialogComponent<T>) => Promise<T>;
};

export type DialogProps<T> = {
  open: boolean;
  onSubmit: (data: T) => Promise<T>;
};

export const DialogsContext = React.createContext<DialogsContextProps>({
  openDialog: () => {
    throw new Error("missing dialog provider");
  },
});

export interface DialogState<T> {
  Component: DialogComponent<T>;
  onSubmit: (data: T) => Promise<T>;
}

export const DialogsProvider = (props: PropsWithChildren<{}>) => {
  const [dialogs, setDialogs] = useState<Array<DialogState<any>>>([]);

  return (
    <DialogsContext.Provider
      value={{
        openDialog: (component) => {
          return new Promise((resolve) => {
            setDialogs((prev) => [
              ...prev,
              {
                Component: component,
                onSubmit: async (data) => {
                  resolve(data);
                  setDialogs(prev.filter((d) => d.Component !== component));
                },
              },
            ]);
          });
        },
      }}
    >
      {props.children}
      {dialogs.map((Dialog, i) => (
        <Dialog.Component key={i.toString()} open={true} onSubmit={Dialog.onSubmit} />
      ))}
    </DialogsContext.Provider>
  );
};
