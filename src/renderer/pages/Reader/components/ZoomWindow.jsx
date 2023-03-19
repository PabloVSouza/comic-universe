import { useState, useRef } from "react";
import classNames from "classnames";
import Image from "components/Image";

import style from "./ZoomWindow.module.scss";

const ZoomWindow = ({ mousePos, image, visible }) => {
  const windowRef = useRef(null);

  const [zoomFactor, setZoomFactor] = useState(2);

  const windowPosition = () => {
    if (!!windowRef.current && mousePos.y) {
      const { offsetHeight, offsetWidth } = windowRef.current;

      return {
        top: mousePos.y - offsetHeight / 2,
        left: mousePos.x - offsetWidth / 2,
      };
    }
    return {};
  };

  const changeZoomFactor = (e) => {
    const delta = e.deltaY;

    if (delta > 0) {
      if (zoomFactor - 1 >= 2) {
        setZoomFactor(zoomFactor - 1);
      }
    } else {
      setZoomFactor(zoomFactor + 1);
    }
  };

  const zoomPosition = () => {
    if (!!windowRef.current && mousePos.y) {
      const { offsetHeight, offsetWidth } = windowRef.current;

      return {
        top: mousePos.y * zoomFactor * -1 + offsetHeight / 2,
        left: mousePos.x * zoomFactor * -1 + offsetWidth / 2,
        width: `${zoomFactor}00vw`,
        height: `${zoomFactor}00vh`,
      };
    }
    return {};
  };

  return (
    <div
      className={classNames(style.ZoomWindow, visible ? style.visible : null)}
      onWheel={changeZoomFactor}
      style={windowPosition()}
      ref={windowRef}
    >
      <Image
        pure
        src={image}
        className={style.zoomedImage}
        style={zoomPosition()}
      />
    </div>
  );
};

export default ZoomWindow;
