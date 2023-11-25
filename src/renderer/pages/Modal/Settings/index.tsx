import Window from 'components/Window/Window'
import useLang from 'lang'
import style from './style.module.scss'

const ModalSettings = (): JSX.Element => {
  const lang = useLang()

  return (
    <Window close to={'/'} className={style.Settings} contentClassName={style.content}>
      <h1>{lang.Settings.title}</h1>
      <div className={style.options}>
        <div className={style.option}>
          <h2>{lang.Settings.pages.header}:</h2>
        </div>
        <div className={style.option}>
          <h2>{lang.Settings.selectLanguage}:</h2>
        </div>
        <div className={style.option}>
          <h2>{lang.Settings.wallpaper.header}:</h2>
        </div>
      </div>
    </Window>
  )
}

export default ModalSettings
