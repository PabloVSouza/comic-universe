import { useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import slugify from "slugify";

import Image from "components/Image";
import Modal from "components/Modal";

import useReader from "store/reader";
import useGlobal from "store/global";

import style from "./style.module.scss";
import ZoomWindow from "./components/ZoomWindow";

const Reader = () => {
  const navigate = useNavigate();

  const { comicId, number } = useParams();

  const [mousePos, setMousePos] = useState({});
  const [zoomVisible, setZoomVisible] = useState(false);

  const { appPath } = useGlobal((state) => state);
  const {
    activeComic,
    chapter,
    chapters,
    page,
    pages,
    getChapterData,
    setChapter,
    changePage,
  } = useReader((state) => state);

  useMemo(() => {
    getChapterData(comicId, number);
  }, []);

  const chapterIndex = chapters.findIndex(
    (val) => val.number === chapter?.number
  );

  const getPath = (page) =>
    `file:///${path.join(
      appPath,
      "downloads",
      activeComic?.type,
      slugify(activeComic?.name),
      slugify(chapter?.number),
      String(page)
    )}`;

  const nextPage = () => {
    if (page < pages.length - 1) changePage(page + 1);
    if (page === pages.length - 1) {
      getChapterData(comicId, chapters[chapterIndex + 1].number);
    }
  };

  const previousPage = async () => {
    if (page > 0) changePage(page - 1);
    if (page === 0 && chapterIndex > 0) {
      await getChapterData(comicId, chapters[chapterIndex - 1].number);
      await changePage(chapters[chapterIndex - 1].pages.length - 1);
    }
  };

  const handleKeys = (e) => {
    const keys = {
      ArrowLeft: () => {
        previousPage();
      },

      ArrowRight: () => {
        nextPage();
      },

      Escape: () => {
        navigate("/");
      },
    };

    if (keys[e.key]) {
      keys[e.key]();
    }
  };

  const defineMousePos = (e) => {
    setMousePos({ x: e.pageX, y: e.pageY });
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeys);
    return () => {
      document.removeEventListener("keydown", handleKeys);
    };
  }, [chapters, page, pages, changePage, setChapter, chapterIndex]);

  const position = {
    transform: `translateX(-${page * 100}%)`,
  };

  return (
    <>
      <Modal modal="" />
      <div
        className={style.Reader}
        onMouseMoveCapture={(e) => defineMousePos(e)}
        onContextMenu={() => setZoomVisible(!zoomVisible)}
      >
        {pages.length > 0 && (
          <ZoomWindow
            mousePos={mousePos}
            image={getPath(pages[page] ?? pages[0])}
            visible={zoomVisible}
          />
        )}
        <div className={style.pages} style={position}>
          {pages?.map((currentPage) => (
            <div key={currentPage} className={style.page}>
              <div className={style.buttons}>
                <button
                  className={style.btnPrevious}
                  onClick={() => previousPage()}
                />
                <button className={style.btnNext} onClick={() => nextPage()} />
              </div>
              <Image className={style.Image} src={getPath(currentPage)} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Reader;
