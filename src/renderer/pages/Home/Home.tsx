import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import openWindow from 'functions/openWindow'

import HomeTopBar from 'components/HomeComponents/HomeTopBar'
import HomeComicList from 'components/HomeComponents/HomeComicList'
import HomeComicDashboard from 'components/HomeComponents/HomeDashboard'
import HomeNav from 'components/HomeComponents/HomeNav'
import HomeBlankArea from 'components/HomeComponents/HomeBlankArea'
import usePersistStore from 'store/usePersistStore'
import WindowManager from 'components/WindowManager'

import style from './Home.module.scss'

const Home = (): JSX.Element => {
  const { currentUser, setCurrentUser } = usePersistStore()
  const location = useLocation()

  const userActive = !!currentUser.id

  useEffect(() => {
    if (location.pathname === '/users') {
      setCurrentUser({} as UserInterface)
      openWindow({ component: 'Users', props: {} })
    }
  }, [location])

  return (
    <div className={style.Home}>
      <HomeTopBar />
      <HomeNav />
      <WindowManager>
        <div className={style.body}>
          <HomeBlankArea active={!userActive} />
          {userActive && (
            <>
              <HomeComicList />
              <HomeComicDashboard />
            </>
          )}
        </div>
      </WindowManager>
    </div>
  )
}

export default Home
