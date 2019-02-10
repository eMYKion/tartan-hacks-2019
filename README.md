# S t r e t c h e d
Made for TartanHacks 2019

By George Ralph, Alex Tarng, David Chen, Mayank Mali

[DevPost](https://devpost.com/software/s-t-r-e-t-c-h-e-d)

## What is S t r e t c h e d?
S t r e t c h e d is a puzzle game built around an environment-stretching mechanic. One player is inside a level trying to reach a goal. A second player uses a mobile device to stretch the world around the first player to help them reach a goal.

## How we built it
1. node.js - JavaScript networking library
2. socket.io - JavaScript event-driven, real-time networking library
3. three.js - In-browser graphics rendering library
4. Blender - 3D modeling/level design

## Requirements
The server needs several dependencies:
1. npm
2. node.js
3. socket.io
4. express

## How to run
```bash
$ node server.js
```

If `process.env.PORT` and `process.env.IP` is not defined, the server will default to `PORT = 3000` and `IP = 'localhost'`.
You can change these default values at the top of `server.js`
