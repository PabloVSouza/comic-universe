import { parse } from "node-html-parser";

import UseApi from "../lib/api";
import CreateDirectory from "../utils/CreateDirectory";
import DownloadFile from "../utils/DownloadFile";

export class HqRepository {
  constructor(directory, url) {
    this.url = url;
    this.directory = directory;
    this.api = new UseApi().api;
  }

  async getList() {
    try {
      return new Promise((resolve) => {
        resolve();
      });
    } catch (e) {
      throw e;
    }
  }

  async getSynopsis(id) {
    try {
      return new Promise((resolve) => {
        resolve();
      });
    } catch (e) {
      throw e;
    }
  }

  async getChapters(id) {
    try {
      return new Promise((resolve) => {
        resolve();
      });
    } catch (e) {
      throw e;
    }
  }

  async getPages(chapter) {
    try {
      return new Promise((resolve) => {
        resolve();
      });
    } catch (e) {
      throw e;
    }
  }

  async getFullData(id) {
    try {
      return new Promise((resolve) => {
        resolve();
      });
    } catch (e) {
      throw e;
    }
  }

  async downloadChapter(comic, chapter) {
    try {
      return new Promise((resolve) => {
        resolve();
      });
    } catch (e) {
      throw e;
    }
  }
}
