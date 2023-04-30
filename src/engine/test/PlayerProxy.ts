import { PlayerId } from "../../types/basic";
import { State } from "../../types/state";

export class PlayerProxy {
  constructor(private state: State, private id: PlayerId) {}

  get hand() {
    return this.state.players[this.id]!.zones.hand;
  }
}
