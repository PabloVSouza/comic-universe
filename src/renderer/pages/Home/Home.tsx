import Window from 'components/WindowManager/Window'
import TopBar from 'components/HomeComponents/HomeTopBar/HomeTopBar'
import ComicList from 'components/HomeComponents/HomeComicList/HomeComicList'
import ComicDashboard from 'components/HomeComponents/HomeDashboard/HomeDashboard'
import RightNav from 'components/HomeComponents/HomeNav/HomeNav'

import style from './style.module.scss'

const Home = (): JSX.Element => {
  return (
    <>
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
