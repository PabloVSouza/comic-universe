import { useEffect, useState } from 'react'
import style from './SettingsPlugin.module.scss'
import SettingsPluginList from './SettingsPluginList'
import Select from 'components/Select'
import api from 'api'
import Button from 'components/Button'

import downloadIcon from 'assets/download-icon-3.svg'

import useGlobalStore from 'store/useGlobalStore'

const SettingsPlugin = () => {
  const { pluginsList, getPluginInfoList, downloadAndInstallPlugin } = useGlobalStore()

  const [apiPlugins, setApiPlugins] = useState([] as IRepoApiPluginList[])

  const [selectedPluginToInstall, setSelectedPluginToInstall] = useState('' as string | TOption)

  const handleSelectPluginToInstall = (val: TOption) => {
    setSelectedPluginToInstall(val)
  }

  const handleButton = () => {
    if (typeof selectedPluginToInstall === 'object')
      downloadAndInstallPlugin(selectedPluginToInstall.value)
  }

  useEffect(() => {
    getPluginInfoList()
  }, [])

  useEffect(() => {
    api.get('plugins').then((res) => {
      setApiPlugins(res.data)
    })
  }, [])

  useEffect(() => {
    setSelectedPluginToInstall('')
  }, [pluginsList])

  const pluginSelectOptions = apiPlugins
    .map((val) => ({
      label: val.name,
      value: val.repo
    }))
    .filter((val) => !pluginsList.find((plugin) => plugin.name == val.label))

  return (
    <div className={style.SettingsPlugin}>
      <h2>Plugin Settings</h2>
      <div className={style.selectArea}>
        <Select
          className={style.select}
          options={pluginSelectOptions}
          placeholder="Select a plugin to install"
          onChange={(e) => handleSelectPluginToInstall(e as TOption)}
          isDisabled={!pluginSelectOptions.length}
          value={selectedPluginToInstall}
        />
        <Button
          className={style.button}
          icon={downloadIcon}
          theme="pure"
          title="Download and Install Plugin"
          disabled={!selectedPluginToInstall}
          onClick={handleButton}
        />
      </div>
      <SettingsPluginList pluginsList={pluginsList} />
    </div>
  )
}

export default SettingsPlugin
