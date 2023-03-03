import DBRepository from "../implementations/db/DBRepository";
import { ipcMain } from "electron";

const { handle } = ipcMain;

const db = new DBRepository();

const eventList = () => {
  handle("getComicDB", (event, { id }) => db.getComicDB(id));
  handle("getComicChaptersDB", (event, { id }) => db.getComicChaptersDB(id));
  handle("createComicDB", (event, { comic, chapter }) =>
    db.createComicDB(comic, chapter)
  );
};

export default eventList;
