import { CardId, CardModifier, NumberValue } from "../../types/basic";

export function replaceSelfReferencesInModifier(
  modifier: CardModifier,
  card: CardId
): CardModifier {
  switch (modifier.type) {
    case "increment": {
      return {
        ...modifier,
        amount: replaceSelfReferencesInNumberValue(modifier.amount, card),
      };
    }

    default: {
      throw new Error(
        "unwknown modifier for replaceSelfReferences: " +
          JSON.stringify(modifier)
      );
    }
  }
}

export function replaceSelfReferencesInNumberValue(
  value: NumberValue,
  card: CardId
): NumberValue {
  if (typeof value === "number" || typeof value === "string") {
    return value;
  }

  switch (value.type) {
    case "CardNumberValue":
      if (value.card === "self") {
        return {
          ...value,
          card,
        };
      } else {
        return value;
      }

    default: {
      throw new Error(
        "unwknown modifier for replaceSelfReferences: " + JSON.stringify(value)
      );
    }
  }
}
