import * as React from "react";
import { CardId } from "../engine/state";

export const DetailContext = React.createContext<{ cardId?: CardId; setDetail: (id: CardId) => void }>({
  setDetail: (cardID) => {
    throw new Error("use DetailProvider");
  },
});

export const DetailProvider = (props: React.PropsWithChildren<{}>) => {
  const [detailId, setDetail] = React.useState<CardId | undefined>();

  return <DetailContext.Provider value={{ cardId: detailId, setDetail }}>{props.children}</DetailContext.Provider>;
};
