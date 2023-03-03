import axios from "axios";
import { parse } from "node-html-parser";

import CreateDirectory from "../../utils/CreateDirectory";
import DownloadFile from "../../utils/DownloadFile";

export class MangaRepository {
  constructor(directory, url) {
    this.url = url;
    this.directory = directory;
    this.api = axios;
  }

  async getList() {
    try {
      const { data } = await this.api.get(`${this.url}/api/show3.php`);

      const formatted = data.reduce((acc, cur) => {
        return [
          ...acc,
          {
            name: cur.title,
            genres: cur.genre.split(", "),
            cover: cur.cover,
            totalChapters: cur.videos,
            id: cur.slug,
            idSite: cur.hash,
          },
        ];
      }, []);

      return new Promise((resolve) => {
        resolve(formatted);
      });
    } catch (e) {
      throw e;
    }
  }

  async getDetails(id) {
    try {
      const res = await this.api.get(`${this.url}/api/show3.php?id=${id}`);

      return new Promise((resolve) => {
        const { status, synopsis } = res.data[0];
        resolve({ status, synopsis });
      });
    } catch (e) {
      throw e;
    }
  }

  async getChapters(id) {
    try {
      //id = slug

      const res = await this.api.get(`${this.url}/manga/${id}`);

      const parsedData = parse(res.data);
      const json = JSON.parse(parsedData.getElementById("manga-info").rawText);

      return new Promise((resolve) => {
        resolve(json.allposts);
      });
    } catch (e) {
      throw e;
    }
  }

  async getPages(chapter) {
    try {
      const chapterUrl = chapter.chapters[0].id;

      const res = await this.api.get(`${chapterUrl}`);

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
