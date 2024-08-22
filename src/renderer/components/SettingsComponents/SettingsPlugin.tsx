import { useEffect, useState } from 'react'
import SettingsPluginList from './SettingsPluginList'
import Select from 'components/Select'
import api from 'api'
import Button from 'components/Button'
import useGlobalStore from 'store/useGlobalStore'

import downloadIcon from 'assets/download-icon-3.svg'

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
    <div className="grow flex justify-center items-center p-2 flex-col gap-5">
      <h2 className="text-2xl">Plugin Settings</h2>
      <div className="w-full h-12 shrink-0 flex justify-center items-start gap-2">
        <Select
          className="!w-1/2 bg-default rounded-lg"
          options={pluginSelectOptions}
          placeholder="Select a plugin to install"
          onChange={(e) => handleSelectPluginToInstall(e as TOption)}
          isDisabled={!pluginSelectOptions.length}
          value={selectedPluginToInstall}
        />
        <Button
          className="h-full"
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
