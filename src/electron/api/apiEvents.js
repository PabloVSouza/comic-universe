import { app, BrowserWindow, ipcMain } from "electron";
import { parse } from "node-html-parser";
import axios from "axios";

const eventList = () => {
  // win = BrowserWindow.getAllWindows()[0];

  ipcMain.handle("getMangaList", async () => {
    return new Promise((resolve) => {
      axios({
        method: "get",
        url: "https://mangayabu.top/api/show3.php",
      }).then((res) => {
        resolve(res.data);
      });
    });
  });

  ipcMain.handle("getMangaDetails", async (event, payload) => {
    return new Promise((resolve) => {
      axios({
        method: "get",
        url: `https://mangayabu.top/api/show3.php?id=${payload}`,
      }).then((res) => {
        resolve(res.data);
      });
    });
  });

  ipcMain.handle("getMangaData", async (event, payload) => {
    return new Promise((resolve) => {
      axios({
        method: "get",
        url: `https://mangayabu.top/manga/${payload}/`,
      }).then((res) => {
        const parsedData = parse(res.data);

        const json = JSON.parse(
          parsedData.getElementById("manga-info").rawText
        );

        resolve(json);
      });
    });
  });
};

export default eventList;
