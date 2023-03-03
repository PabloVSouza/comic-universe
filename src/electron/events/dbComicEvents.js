import DBRepository from "../implementations/db/DBRepository";
import { ipcMain } from "electron";

const { handle } = ipcMain;

const db = new DBRepository();

const eventList = () => {
  handle("getComicDB", (event, { id }) => db.getComicDB(id));
  handle("createComicDB", (event, { comic, chapters }) =>
    db.getComicDB(comic, chapters)
  );
};

export default eventList;
