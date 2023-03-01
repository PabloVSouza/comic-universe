import { parse } from "node-html-parser";

import UseApi from "../lib/api";
import CreateDirectory from "../utils/CreateDirectory";
import DownloadFile from "../utils/DownloadFile";
import axios from "axios";
import { GraphQLClient, gql } from "graphql-request";

export class HqRepository {
  constructor(directory, url) {
    this.url = url;
    this.directory = directory;
    this.client = new GraphQLClient(this.url);
  }

  async getList() {
    try {
      const query = gql`
        query {
          getAllHqs {
            id
            name
            synopsis
            status
          }
        }
      `;

      const data = await this.client.request(query);

      return new Promise((resolve) => {
        resolve(data.getAllHqs);
      });
    } catch (e) {
      throw e;
    }
  }

  async getDetails(id) {
    try {
      const query = gql`
        query getHqsById($id: Int!) {
          getHqsById(id: $id) {
            cover: hqCover
            publisher: publisherName
            chapters: capitulos {
              name
              id
              number
              pages: pictures {
                url: pictureUrl
              }
            }
          }
        }
      `;

      const variables = {
        id: Number(id),
      };

      const res = await this.client.request(query, variables);

      const data = res.getHqsById[0];
      data.totalChapters = data.chapters.length;

      return new Promise((resolve) => {
        resolve(data);
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
