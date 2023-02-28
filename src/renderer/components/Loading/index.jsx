import Cover from "components/Cover";
import Image from "components/Image";

import imgLoading from "assets/loading.gif";

import { useLoading } from "store/loading";

const Loading = () => {
  const { status } = useLoading((state) => state);
  return (
    <Cover visible={status} index="999">
      <Image pure src={imgLoading} alt="" />
    </Cover>
  );
};

export default Loading;
