const CreateDirectory = (path) => {
  return new Promise((resolve) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, {
        recursive: true,
      });
    }
    resolve(path);
  });
};

export default CreateDirectory;
