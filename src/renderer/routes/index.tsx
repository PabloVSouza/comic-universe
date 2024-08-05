import { ReactElement } from 'react'
import { Route, Routes, Navigate, RoutesProps } from 'react-router-dom'

import Home from 'pages/Home'
import Reader from 'pages/Reader'

const Router = (): ReactElement<RoutesProps> => {
  return (
    <Routes>
      <Route path="/" element={<Home />}>
        <Route path="/*" element={<Navigate to="/" />} />
      </Route>
      <Route path="/reader/:comicId/:chapterId" element={<Reader />} />
      <Route path="/users" element={<Home />} />
    </Routes>
  )
}

export default Router
