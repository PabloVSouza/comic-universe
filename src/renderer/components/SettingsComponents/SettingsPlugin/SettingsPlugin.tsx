import { useState, useEffect } from 'react'
import Dropzone from 'components/Dropzone'
import style from './SettingsPlugin.module.scss'
import SettingsPluginList from './SettingsPluginList'

import useGlobalStore from 'store/useGlobalStore'

const SettingsPlugin = () => {
  const { pluginsList, getPluginInfoList } = useGlobalStore()

  useEffect(() => {
    getPluginInfoList()
  }, [])

  return (
    <div className={style.SettingsPlugin}>
      <h2>Plugin Settings</h2>
      <Dropzone />
      <SettingsPluginList pluginsList={pluginsList} />
    </div>
  )
}

export default SettingsPlugin
