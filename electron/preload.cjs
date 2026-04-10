const { contextBridge, ipcRenderer } = require('electron');

const apiArg = process.argv.find(arg => arg.startsWith('--pos-api-url='));
const apiUrl = apiArg ? apiArg.replace('--pos-api-url=', '') : null;

contextBridge.exposeInMainWorld('posDesktop', {
  apiUrl,
  isElectron: true,
  launcher: {
    getState: () => ipcRenderer.invoke('launcher:get-state'),
    openDesktop: () => ipcRenderer.invoke('launcher:open-desktop'),
    openBrowser: (browserId) => ipcRenderer.invoke('launcher:open-browser', browserId),
    openDefaultBrowser: () => ipcRenderer.invoke('launcher:open-default-browser'),
  },
});
