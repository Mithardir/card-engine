import { ViewModifier } from "./ViewModifier";
import { CardModification } from "./CardModification";
import { CardId } from "../../types/state";

export function modifyCard(id: CardId, modifier: CardModification): ViewModifier {
  return {
    print: `modifyCard(${id}, ${modifier.print})`,
    modify: (v) => {
      const card = v.cards[id];
      if (card) {
        modifier.modify(card, v);
      }
    },
  };
}
