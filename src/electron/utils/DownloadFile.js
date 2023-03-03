import axios from "axios";
import fs from "fs";

const DownloadFile = async (path, url) => {
  const fileName = await url.substring(url.lastIndexOf("/") + 1);

  try {
    const response = await axios({
      method: "get",
      url,
      responseType: "stream",
    });

    await response.data.pipe(fs.createWriteStream(path + fileName));

    return new Promise((resolve) => {
      resolve(fileName);
    });
  } catch (e) {
    throw e;
  }
};

export default DownloadFile;
