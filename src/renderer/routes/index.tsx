import { FC } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { Home, Reader } from 'layouts'

const Router: FC = () => {
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
