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
  const [Dialog, setDialog] = useState<DialogState<any> | undefined>();

  return (
    <DialogsContext.Provider
      value={{
        openDialog: (component) => {
          return new Promise((resolve) => {
            setDialog({
              Component: component,
              onSubmit: async (data) => {
                resolve(data);
                setDialog(undefined);
              },
            });
          });
        },
      }}
    >
      {props.children}
      {Dialog && <Dialog.Component open={true} onSubmit={Dialog.onSubmit} />}
    </DialogsContext.Provider>
  );
};
