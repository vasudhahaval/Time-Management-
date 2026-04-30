const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setDuration: (seconds) => ipcRenderer.invoke('set-duration', seconds),
});