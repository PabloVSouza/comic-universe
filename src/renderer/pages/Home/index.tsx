import { useSearchParams } from 'react-router-dom'

import Window from 'components/Window/Window'
import TopBar from '../../components/HomeTopBar/HomeTopBar'
import ComicList from '../../components/HomeComicList/HomeComicList'
import ComicDashboard from '../../components/HomeDashboard/HomeDashboard'
import RightNav from '../../components/UserNav/UserNav'
import Modal from 'pages/Modal'

import style from './style.module.scss'

const Home = (): JSX.Element => {
  const [searchParams] = useSearchParams()

  const { modal } = Object.fromEntries([...searchParams])
  const modalParams = {
    ...Object.fromEntries([...searchParams])
  }

  return (
    <>
      {!!modal && <Modal {...modalParams} />}
      <Window className={style.Home} contentClassName={style.content}>
        <TopBar />
        <RightNav />
        <div className={style.body}>
          <ComicList />
          <ComicDashboard />
        </div>
      </Window>
    </>
  )
}

export default Home
