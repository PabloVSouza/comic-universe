import { Route, Routes, Navigate } from "react-router-dom";

import Home from "pages/Home";
import Download from "pages/Download";
import Reader from "pages/Reader";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route path="/*" element={<Navigate to="/" />} />
      </Route>
      <Route path="/download/:id" element={<Download />} />
      <Route path="/reader/:comicId/:number" element={<Reader />} />
    </Routes>
  );
};

export default Router;
