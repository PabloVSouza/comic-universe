import { app, ipcMain } from "electron";

import { MangaRepository } from "../implementations/MangaRepository";
import { HqRepository } from "../implementations/HqRepository";

const eventList = () => {
  const { handle } = ipcMain;

  const repo = {
    manga: new MangaRepository(
      `${app.getPath("userData")}/downloads/mangas`,
      "https://mangayabu.top"
    ),
    hq: new HqRepository(
      `${app.getPath("userData")}/downloads/hqs`,
      "https://admin.hq-now.com/graphql"
    ),
  };

  handle("getList", (event, { type }) => repo[type].getList());
  handle("getDetails", (event, { type, id }) => repo[type].getDetails(id));
  handle("getChapters", (event, { type, id }) => repo[type].getChapters(id));
  handle("getPages", (event, { type, chapter }) =>
    repo[type].getPages(chapter)
  );
  handle("getFullData", (event, { type, id }) => repo[type].getFullData(id));
  handle("downloadChapter", (event, { type, comic, chapter }) =>
    repo[type].downloadChapter(comic, chapter)
  );
};

export default eventList;
