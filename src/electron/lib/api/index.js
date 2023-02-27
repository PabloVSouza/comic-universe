import axios from "axios";

import { BrowserWindow } from "electron";

// const win = BrowserWindow.getAllWindows([0]);

// const { send } = win.webContents;

const api = axios.create();

// api.interceptors.request.use((config) => {
//   send("loading", true);
//   return config;
// });

// api.interceptors.response.use((response) => {
//   send("loading", false);
//   return response;
// });

export default api;
