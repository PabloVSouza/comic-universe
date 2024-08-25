const { invoke, on } = window.Electron.ipcRenderer

const IpcImplementation = { invoke, on }

export default IpcImplementation
