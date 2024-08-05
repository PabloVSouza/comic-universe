import TopBar from 'components/HomeComponents/HomeTopBar/HomeTopBar'
import ComicList from 'components/HomeComponents/HomeComicList/HomeComicList'
import ComicDashboard from 'components/HomeComponents/HomeDashboard/HomeDashboard'
import RightNav from 'components/HomeComponents/HomeNav/HomeNav'

import style from './Home.module.scss'

const Home = (): JSX.Element => {
  return (
    <div className={style.Home}>
      <TopBar />
      <RightNav />
      <div className={style.body}>
        <ComicList />
        <ComicDashboard />
      </div>
    </div>
  )
}

export default Home
