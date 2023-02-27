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
      const res = await api.get(`${this.url}/api/show3.php`);

      return new Promise((resolve) => {
        resolve(res.data);
      });
    } catch (e) {
      throw e;
    }
  }

  async getDetails(id) {
    try {
      const res = await api.get(`${this.url}/api/show3.php?id=${id}`);

      return new Promise((resolve) => {
        resolve(res.data);
      });
    } catch (e) {
      throw e;
    }
  }

  async getChapters(id) {
    try {
      //id = slug
      const res = await api.get(`${this.url}/manga/${id}`);

      const parsedData = parse(res.data);
      const json = JSON.parse(parsedData.getElementById("manga-info").rawText);

      return new Promise((resolve) => {
        resolve(json);
      });
    } catch (e) {
      throw e;
    }
  }

  async getPages(chapter) {
    try {
      const chapterUrl = chapter.chapters[0].id;

      const res = await api.get(`${chapterUrl}`);

      const parsedData = parse(res.data);

      const images = parsedData.querySelectorAll(".table-of-contents img");

      const pageLinks = [];

      for (const image of images) {
        const url = image.getAttribute("src");
        if (!url.includes("capa")) {
          pageLinks.push(url);
        }
      }

      return new Promise((resolve) => {
        resolve(pageLinks);
      });
    } catch (e) {
      throw e;
    }
  }

  async downloadChapter(comic, chapter) {
    const path = `${this.directory}/${comic.slug}`;

    const chapterPath = path + `/${chapter.num}/`;

    CreateDirectory(path);

    const cover = await DownloadFile(path, chapter.cover);

    const pageFiles = [];

    for (const page of chapter.pages) {
      pageFiles.push(await DownloadFile(chapterPath, page));
    }

    return new Promise((resolve) => {
      resolve({ cover, pageFiles });
    });
  }
}
