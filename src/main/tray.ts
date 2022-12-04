import { BrowserWindow, Menu, Tray } from 'electron'
import path from 'path'

export function createTray(window: BrowserWindow) {
  const tray = new Tray(path.resolve(__dirname, 'rotionTemplate.png'))

  const menu = Menu.buildFromTemplate([
    { label: 'Rotion', enabled: false },
    { type: 'separator' },
    {
      label: 'Criar novo documento',
      click: () => {
        window.webContents.send('new-document')
      },
    },
    { type: 'separator' },
    { label: 'Documentos recentes', enabled: false },
    {
      label: 'Ignite',
      accelerator: 'CommandOrControl+1',
      acceleratorWorksWhenHidden: false,
    },
    { type: 'separator' },
    { label: 'Sair', role: 'quit' },
  ])

  tray.setContextMenu(menu)
}
