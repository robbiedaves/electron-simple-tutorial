# Electron Simple Tutorial

https://www.youtube.com/watch?v=jKzBJAowmGg&list=PL1QRvYV-LXn6ESBl7qm1teB1U1CK1B6gv

### Getting Started
Create a folder > simple-electron-tutorial
In the folder type
```
npm init
```

Next install electron, so type

```
npm install electron --save-dev
```

Next open the editor and create a new file called main.js
This will be the main entry point for our desktop application.

In the file, copy the following code:

```javascript
const electron = require('electron');
const {app, BrowserWindow} = electron

app.on('ready', () => {
    let win = new BrowserWindow({width: 800, height: 600});
    win.loadURL(`file://${__dirname}/index.html`);
    win.webContents.openDevTools();
})
```

Next, create a new html file called index.html and copy the following html:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Robxx</title>
</head>

<body>
    <h1>Grrrrr</h1>
</body>

</html>
```


Next, in the package.json file, change the “main” tag to main.js and add a new start script with “electron .” to allow us to start the electron application using “npm start” from the command line.
The file should look like this:

```json
{
  "name": "electron-simple-tutorial",
  "version": "1.0.0",
  "description": "A simple electron application",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "Robin Davies",
  "license": "ISC",
  "devDependencies": {
    "electron": "1.7.12"
  }
}
```

Now, on the command line, you can start the application using:
```
npm start
```

Add a button
Open the index.html file and in the body add the following line:

```html
<script>require('./index.js')</script>
```

```html
The html file should now look like this:
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Robxx</title>
</head>

<body>
    <h1>Grrrrr</h1>
    <script>require('./index.js')</script>
</body>

</html>
```

Note:
We could have added the following:
```html
<script src=”main.js”></script> 
```
Instead of :
```html
<script>require('./index.js')</script>
```

Both versions work perfectly, but you need to be aware that in Electron, there are 2 contexts the javascript can be run in. The first is a standard client side js, and the second is using the node server side kind of context. The tutorial suggests using the node context so use the require statement. It’s a small note but worth knowing.

Then add a new index.js file and copy the following code to add a button to the document.

```javascript
var button = document.createElement('button')
button.textContent = 'Open Window'
document.body.appendChild(button)
```

Restart the application and you should see a new button displayed.

### Processes
It’s important to understand Electron has 2 processes running.
The first is the main process which in our application is represented in our main.js file. This process handles the lifecycle of the application, like opening and closing the app etc.
The other process is the renderer process, which is the actual window and the frame.

In many cases we want the renderer to talk to the main process, such as if we want want the main process to open up a new window

So to show this, add the following function to the main.js file, which we will export and creates a new window. (Note: this is in the main.js file so it will be part of the main process)

```javascript
exports.openWindow = () => {
    let win = new BrowserWindow({width:400, height:200})
    win.loadURL(`file://${__dirname}/bear.html`)
}
```

So, whenever this function is called a new window will be opened.
So in order to call this openWindow api on our main process, from our renderer process we need to access something called a remote.

Change index.js to be the following:

```javascript
const remote = require('electron').remote
const main = remote.require('./main.js')

var button = document.createElement('button')
button.textContent = 'Open Window'
button.addEventListener('click', () => {
    main.openWindow()
})
document.body.appendChild(button)
```

Notice, to call the exported function in main.js we had to get hold of the remote object. Then we add an event listener and onclick we call the openWindow function.

Now, rerun the application and you should see the window is opened when the button is clicked.

We didn’t add the bear.html file, so create a new file called bear.html and copy the following:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>bear</title>
</head>

<body>
    <h1>The bear html file</h1>
</body>

</html>
```

Re-run again and now you can see some content in the new window.


### Adding a Menu
In the index.js we want to add a menu. Again because this is run from the renderer context, we cannot just use Menu, we have to get this from the remote. We already added the remote field, so we can go ahead a requite the menu from the remote.
```javascript
const Menu = remote.Menu;
```

There are a couple of ways to create a menu. We can add the items individually or we can use a template that is available on the Menu.
The index.js file should now look like this:

```javascript
const remote = require('electron').remote
const Menu = remote.Menu;
const main = remote.require('./main.js')


const menuTemplate = [
    {
        label: 'Electron', 
        submenu: [
            {
                label: 'Prefs',
                click: function() {

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
```

You can see we created a menu template then added this to the menu. We haven’t added anything on the click function yet.

### Sending Messages between Renderer and Main Processes
We will communicate between the main and renderer processes to display the prefs window.

Create a new prefs.html file and copy the following code:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Prefs</title>
</head>

<body>
    <h1>Prefs</h1>
    <script>
        const {ipcRenderer} =require(‘electron’)
        var button = document.createElement('button')
        button.textContent = "Hide"
        button.addEventListener('click', function() {
            ipcRenderer.send('toggle-prefs')
        })
        document.body.appendChild(button)
    </script>
</body>

</html>
```

The script is inline in the html this time (we could put it in it’s own js file if we want). You can see that we need to get the ipcRenderer and then use this to send a message (‘toggle-prefs’) to the main process. 

Change the main.js file to include the following:

```javascript
const electron = require('electron');
const {app, BrowserWindow, ipcMain} = electron

app.on('ready', () => {
    let win = new BrowserWindow({width: 800, height: 600});
    win.loadURL(`file://${__dirname}/index.html`);
    win.webContents.openDevTools();

    var prefsWindow = new BrowserWindow({
        width: 400,
        height:400,
        show: false
    })
    prefsWindow.loadURL(`file://` + __dirname + `/prefs.html`)
    prefsWindow.webContents.openDevTools();

    ipcMain.on('toggle-prefs', function() {
      if (prefsWindow.isVisible()) {
        prefsWindow.hide()
      } else {
        prefsWindow.show()
      }
    })
    
})

exports.openWindow = () => {
    let win = new BrowserWindow({width:400, height:200})
    win.loadURL(`file://${__dirname}/bear.html`)
}
```

You can see here, we create a new prefsWindow, then we listen for a message using the ipc.on(‘toggle-prefs’), and toggle the window.

Again, we had to require the ipcMain in this file as this is the main process and not the renderer process.








