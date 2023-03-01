import { Route, Routes, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import SearchComic from "pages/SearchComic";
import DownloadComic from "pages/DownloadComic";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route path="/*" element={<Navigate to="/" />} />
      </Route>
      <Route path="/search" element={<SearchComic />} />
      <Route path="/download/:id" element={<DownloadComic />} />
    </Routes>
  );
};

export default Router;
