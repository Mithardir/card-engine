import { CardId, CardModifier, NumberValue } from "../types/basic";

export interface RulesModifier {
  changeCardModifier(modifier: CardModifier): CardModifier;
  changeNumberValue(numberValue: NumberValue): NumberValue;
}

export const replaceSelf = (cardId: CardId): RulesModifier => {
  const changeCardModifier = (modifier: CardModifier): CardModifier => {
    if (modifier.type === "increment") {
      return {
        ...modifier,
        amount: changeNumberValue(modifier.amount),
      };
    } else {
      throw new Error(
        "unknown modifier for replaceSelfReferences: " +
          JSON.stringify(modifier)
      );
    }
  };

  const changeNumberValue = (value: NumberValue): NumberValue => {
    if (typeof value === "number" || typeof value === "string") {
      return value;
    }

    if (value.type === "CardNumberValue") {
      if (value.card === "self") {
        return {
          ...value,
          card: cardId,
        };
      } else {
        return value;
      }
    }

    throw new Error(
      "unknown modifier for replaceSelfReferences: " + JSON.stringify(value)
    );
  };

  return {
    changeCardModifier,
    changeNumberValue,
  };
};
