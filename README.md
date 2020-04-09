# TORRENTFLIX

![GitHub package.json version](https://img.shields.io/github/package-json/v/rogelio-o/torrentflix)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

# Description

Torrentflix provides you a way to manage your favourites TV Shows & Movies, you can add them and all the information will be pulled from TMDB and TTVDB apis. Episodes, dates, descriptions, images... Track what episode you have not seen yet easily.

At the same time, Torrentflix includes a Torrent client which broadcasts multimedia files to any Chromecast or DLNA device. Also, torrent downloads can be broadcast to the device (if the browser support the file format) or they can be reproduced by any DLNA reproduced in which you can put the URI of the streaming service (like VLC).

This project is a good fit to your Raspberry PI. The required databse is just a SQLite DB. Server exposes an API that is used by the frontend, but it could be used by any mobile APP, browser extension,...

# Screenshots

![Screenshot 1](/screenshots/screenshot-01.png?raw=true "Home")

![Screenshot 2](/screenshots/screenshot-02.png?raw=true "TV Show View")

# Installation

**INFO:** This is a node application, so NodeJS and NPM have to be installed on the system.

Clone the repo:

```
git clone https://github.com/rogelio-o/torrentflix
```

Add the following environment variables to your system before to build the frontend (or add it at the beggining of the build command), they will be required at build time:

- **PUBLIC_URL:** _(optional)_ overrides inferred URL. By default is the URL from which the app is retrieved.
- **REACT_APP_SCHEMA:** _(optional)_ overrides default backend schema (http:// or https://). By default it is the same than in the PUBLIC_URL.
- **REACT_APP_HOST:** _(optional)_ overrides default backend host. By default it is the same than in the PUBLIC_URL.
- **REACT_APP_PORT:** _(optional)_ overrides default backend port. By default it is the same than in the PUBLIC_URL.
- **REACT_APP_BASE_PATH:** _(optional)_ overrides default backend base path. By default it is the same than in the PUBLIC_URL.

The frontend is a React application. To build the frontend:

```
cd frontend
npm install
npm run build
cd ..
```

Build the backend:

```
npm install
npm run build
```

Add the following environment variables to your system, they will be required by the backend at runtime:

- **DATA_FOLDER:** Path where the torrent files, sqlite DB and log files are stored. By default it is "/tmp", valid for development purpose but not for production environment, so it is required to add this env variable.
- **TMDB_API_KEY:** The API key to be used in TMDB service. You can get one (for free) signing up in [TMDB](https://www.themoviedb.org/).
- **TTVDB_API_KEY:** The API key to be used in TTVDB service. You can get one (for free) signing up in [TTVDB](https://thetvdb.com/.
- **TORRENT_PROVIDERS:** _optional_ The torrent providers in which the torrent client will search the torrents files. You can add more than one adding a comma between them. [torrent-search-api](https://github.com/JimmyLaurent/torrent-search-api) is the library used to search, so all the providers supported by this library are the ones supported by the backend. By default, it is "".
- **SCHEMA:** _(optional)_ The schema of the backend. By default it is "http://".
- **HOST:** _(optional)_ The host of the backend. By default it is "localhost".
- **PORT:** _(optional)_ The port of the backend. By default it is "9090".
- **BASE_PATH:** _(optional)_ The base path of the backend. By default, it is "ThePirateBay,Rarbg,1337x".
- **CORS:** _(optional)_ "true" if the frontend is in a different port or host to allow CORS. By default, it is "false".

Run the backend:

```
npm start
```

Now you can go to http://localhost:9090 (or http://raspberrypi.local:9090 if you are installing it on a Raspberry PI). It would be a good option to add `npm start` as a systemctl service. This systemctl service could be enabled to start on each boot.
