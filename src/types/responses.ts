import { CardId } from "./basic";

export type Responses = {
  enemyDestoryed: {
    attackers: CardId[];
    enemyDestoryed: { attackers: CardId[] };
  };
  cardReveladed: {
    card: CardId;
  };
  receivedDamage: {
    card: CardId;
    amount: number;
  };
};
