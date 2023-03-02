import axios from "axios";
import fs from "fs";

const DownloadFile = async (path, url) => {
  const fileName = url.substring(url.lastIndexOf("/") + 1);
  try {
    await axios({
      method: "get",
      url,
      responseType: "stream",
    }).then((res) => {
      res.data.pipe(fs.createWriteStream(path + fileName));

      return new Promise((resolve) => {
        resolve(fileName);
      });
    });
  } catch (e) {
    throw e;
  }
};

export default DownloadFile;
