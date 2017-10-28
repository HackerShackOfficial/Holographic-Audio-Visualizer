# Holographic-Audio-Visualizer

Holographic audio visualizer that plays Soundcloud playlists and animates graphics in realtime with the music. The visualizer can be controlled with hand gestures using a motion control board (powered by a Raspberry Pi).

[Original video](https://youtu.be/MrgGXQvAuR4)

## Setup

This project runs on two different devices. A Raspberry Pi controls the Flick gesture recognition board which sends commands to the visualizer running on a more powerful Mac/Windows/Linux computer with support for webGL to run the graphics.

To start, make sure that you download this repository on the computer that you want to run the visualizer on and the Raspberry Pi. 

### Visualizer

The visualizer must run on a normal computer since the 3d visualizer animations lag on the Raspberry Pi. The visualizer animations are run in an [Electron](https://electron.atom.io/) environment and use Three.js (a WebGL library) for 3d graphics. A server running with Node.js allows communication with the hand gesture board. 

Start by installing the latest stable version of [Node.js](https://nodejs.org/en/) on your computer. I used version 6.x.

Next, navigate to the repository directory and run `sudo npm install` to install the dependencies for the project.

Start the visualizer with

```
npm start
```

The Soundcloud playlist can be changed by modifying the `const playlist = 'path/to/playlist';` const in the `renderer.js` file. The path can be found by extracting the end of the url for a Soundcloud playlist. For example, if the url for a playlist is

```
https://soundcloud.com/someartist/sets/aplaylist
```
The const would be 

```
const playlist = 'someartist/sets/aplaylist';
```

### Controls

First, make sure that you have the necessary dependencies installed on your Raspberry Pi for the Flick gesture board. Start by running the following command in your terminal:

```
curl -sSL https://pisupp.ly/flickcode | sudo bash
```

Make sure to restart your Pi, then run the following command in the terminal to test your Flick board. You'll need to make sure it's [wired properly](https://www.pi-supply.com/make/flick-quick-start-faq/) before testing.

```
flick-demo
```

The controls portion of this project runs on a Raspberry Pi with a python program. You'll need to make sure that your Raspberry Pi uses python 2.7 so that the program runs properly. You can check the version of python running on your system by running: 

```
python --version
```

Navigate to the controls folder in the repository directory and execute the following command to install all of the dependencies:

```
sudo pip install -r requirements.txt
```

Before running the controls program, modify the `swipe-controller.py` file by replacing the `<HOST_IP>` portion of the `host = 'http://<HOST_IP>:3000'` variable with the local IP of the computer running the visualizer. 

*Note: both computers must be on the same network. You can find the IP address of your computer by typing `ifconfig` (`ipconfig /all` on windows) in the terminal and looking for the inet address.*

Run the program with

```
python swipe-controller.py
```

Once both programs are running, you can test it out!

## Visualizer Interface

The visualizer is controlled with web requests. The following urls can be typed in the browser to control the visualizer. 

| Command  | Description |
| ------------- | ------------- |
| http://localhost:3000/next  | advance to the next song  
| http://localhost:3000/prev  | play the last song
| http://localhost:3000/changeVis | change to the next visualizer
| http://localhost:3000/toggleVis | toggle the visualizer colors
| http://localhost:3000/toggle | start/stop the current song
| http://localhost:3000/volume?level=50 | change the volume to 50 (can be 1 - 100)

*localhost:3000 can be replaced with the local IP of your computer to control it from another device on the same network.*
