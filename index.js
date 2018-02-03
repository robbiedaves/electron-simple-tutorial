const remote = require('electron').remote
const Menu = remote.Menu;
//var ipc = remote.require('ipc');
var ipcRenderer = require('electron').ipcRenderer
const main = remote.require('./main.js');


const menuTemplate = [
    {
        label: 'Electron', 
        submenu: [
            {
                label: 'Prefs',
                click: function() {
                    ipcRenderer.send('toggle-prefs')
                }
            }
        ]    
    }
];

var menu = Menu.buildFromTemplate(menuTemplate)

Menu.setApplicationMenu(menu)

var button = document.createElement('button')
button.textContent = 'Open Window'
button.addEventListener('click', () => {
    main.openWindow()
})
document.body.appendChild(button)