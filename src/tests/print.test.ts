import prettier from "prettier";
import {
  startGame,
} from "../engine/actions/phases";

it("Prints rule script", () => {  
  const action = startGame;
  console.log(action.print);
  console.log(prettier.format(action.print));
});
