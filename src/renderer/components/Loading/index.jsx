import Cover from "components/Cover";
import Image from "components/Image";

import imgLoading from "assets/loading.gif";

const Loading = () => {
  const loading = false;
  return (
    <Cover visible={loading} index="999">
      <Image pure src={imgLoading} alt="" />
    </Cover>
  );
};

export default Loading;
