let IpcImplementation = {}

if (window.Electron) {
  const { invoke, on } = window.Electron.ipcRenderer
  IpcImplementation = { invoke, on }
}

export default IpcImplementation
