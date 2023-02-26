import { Route, Routes, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import SearchManga from "pages/SearchManga";
import DownloadManga from "pages/DownloadManga";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route path="/*" element={<Navigate to="/" />} />
      </Route>
      <Route path="/search" element={<SearchManga />} />
      <Route path="/download/:slug" element={<DownloadManga />} />
    </Routes>
  );
};

export default Router;
