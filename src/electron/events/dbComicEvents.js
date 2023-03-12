import DBRepository from "../implementations/db/DBRepository";
import { ipcMain } from "electron";

const { handle } = ipcMain;

const db = new DBRepository();

const eventList = () => {
  handle("getComicDB", (event, { id }) => db.getComicDB(id));
  handle("getChaptersDB", (event, { comicId }) => db.getChaptersDB(comicId));
  handle("createComicDB", (event, { comic, chapter }) =>
    db.createComicDB(comic, chapter)
  );
  handle("getListDB", (event) => db.getListDB());
  handle("getReadProgressDB", (event, search) => db.getReadProgressDB(search));
  handle("changePageDB", (event, data) => db.changePageDB(data));
};

export default eventList;
