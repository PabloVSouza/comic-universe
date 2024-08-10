import Dropzone from 'components/Dropzone'
import style from './SettingsPlugin.module.scss'

const SettingsPlugin = () => {
  return (
    <div className={style.SettingsPlugin}>
      <h2>Plugin Settings</h2>
      <Dropzone />
    </div>
  )
}

export default SettingsPlugin
