import Datastore from "nedb";
import { app } from "electron";

const Comic = new Datastore({
  filename: `${app.getPath("userData")}/db/Comic.db`,
  timestampData: true,
  autoload: true,
});
const Chapter = new Datastore({
  filename: `${app.getPath("userData")}/db/Chapter.db`,
  timestampData: true,
  autoload: true,
});

const User = new Datastore({
  filename: `${app.getPath("userData")}/db/User.db`,
  timestampData: true,
  autoload: true,
});

const ReadProgress = new Datastore({
  filename: `${app.getPath("userData")}/db/ReadProgress.db`,
  timestampData: true,
  autoload: true,
});

const db = {
  Comic,
  Chapter,
  User,
  ReadProgress,
};

export default db;
