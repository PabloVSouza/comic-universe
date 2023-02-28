import axios from "axios";
import { BrowserWindow } from "electron";

export default class UseApi {
  constructor() {
    this.win = BrowserWindow.getAllWindows()[0];
    this.api = axios.create();

    this.api.interceptors.request.use((config) => {
      this.win.webContents.send("loading", { status: true });
      return config;
    });

    this.api.interceptors.response.use((response) => {
      this.win.webContents.send("loading", { status: false });
      return response;
    });
  }
}
