import * as allies from "./allies";
import * as attachments from "./attachments";
import * as enemies from "./enemies";
import * as events from "./events";
import * as heroes from "./heroes";
import * as locations from "./locations";
import * as quests from "./quests";
import * as treacheries from "./treacheries";

export const cards = {
  ...heroes,
  ...allies,
  ...locations,
  ...enemies,
  ...attachments,
  ...events,
  ...quests,
  ...treacheries,
};
