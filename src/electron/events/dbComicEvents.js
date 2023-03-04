import DBRepository from "../implementations/db/DBRepository";
import { ipcMain } from "electron";

const { handle } = ipcMain;

const db = new DBRepository();

const eventList = () => {
  handle("getComicDB", (event, { id }) => db.getComicDB(id));
  handle("getChaptersDB", (event, { id }) => db.getChaptersDB(id));
  handle("createComicDB", (event, { comic, chapter }) =>
    db.createComicDB(comic, chapter)
  );
  handle("getListDB", (event) => db.getListDB());
};

export default eventList;
