import { contextBridge } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import fs from "fs";
import path from "path";

const packageJson = fs.readFileSync(__dirname + "/../../package.json");
const { version, description, repository, license, author } =
  JSON.parse(packageJson);

const api = {};

const app = { version, description, repository, license, author };

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("Electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
    contextBridge.exposeInMainWorld("path", path);
    contextBridge.exposeInMainWorld("app", app);
  } catch (error) {
    console.error(error);
  }
} else {
  window.Electron = electronAPI;
  window.api = api;
  window.path = path;
  window.app = app;
}
