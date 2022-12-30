import { CardId } from "./basic";

export type Events = {
  enemyDestroyed: {
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
