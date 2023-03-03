import { app, ipcMain } from "electron";

const eventList = () => {
  const { handle } = ipcMain;

  handle("getAppPath", () => app.getPath("userData"));
};

export default eventList;
