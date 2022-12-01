# Solar Tweaks ☀️

![GitHub](https://img.shields.io/github/license/Solar-Tweaks/Solar-Tweaks?style=for-the-badge)
![GitHub all releases](https://img.shields.io/github/downloads/Solar-Tweaks/Solar-Tweaks/total?style=for-the-badge)
![GitHub package.json version](https://img.shields.io/github/package-json/version/Solar-Tweaks/Solar-Tweaks?style=for-the-badge)
![Maintenance](https://img.shields.io/maintenance/yes/2022?style=for-the-badge)

Solar Tweaks is a software that allows you to tweak Lunar Client to your liking and re-enable some features that are completely disabled such as Freelook, AutoTextHotkey, removing pinned servers, changing FPS text etc...

However, SolarTweaks is to use at your own risk. Editing Lunar Client source code is not allowed! You can read Lunar Client's Terms of Service [here](https://www.lunarclient.com/terms). We are not responsible for **any** damage caused by using Solar Tweaks.

# Installing ⬇️

You can download the latest version of Solar Tweaks from the [GitHub releases page](https://github.com/Solar-Tweaks/Solar-Tweaks/releases). You need to download the version corresponding to your operating system (OS). You can find a more in depth explanation on how to download [here](https://github.com/Solar-Tweaks/Solar-Tweaks/wiki/Download-Solar-Tweaks)

If you want a complete tutorial about how to install Solar Tweaks for your specific operating system, ~~you can read the installation guide on [our wiki](https://www.youtube.com/watch?v=dQw4w9WgXcQ).~~ More info on the installation process soon.

# Usage ⚒️

When you launch the app, you will be welcomed by a user interface similar to the one in the original Lunar Client Launcher. This is on purpose, as we want to make Solar Tweaks look as close as possible to the original Lunar Client so users can easily switch between them without getting confused.

⚠️ **Please note that Solar Tweaks is not a replacement for Lunar Client. Solar Tweaks is a modification tool for Lunar Client**

Tweak and customize your game by going to the **Engine** tab, change the launcher and JRE preferences in the **Settings** tab and launch the game using any tab you want since the big green button is always there.

# Building from source 🏗️

Solar Tweaks is fully open source which means you can build it from source and add your own modifications to it. To do so, clone this repository using
```bash
$ git clone https://github.com/Solar-Tweaks/Solar-Tweaks.git
```
Once the repo is downloaded move to the directory and install the dependencies
```bash
$ cd Solar-Tweaks
$ npm install
```
If you want to start a development version run this command (This will build the app and start it for you. This will also include hot reload for easier development and testing)
```bash
$ npm run serve
```
Finally if you want to build the app run this command. All executables, installers, etc... will be created in the `dist` directory.
```bash
$ npm run build
```

**Note:** If you have an error that is `"error:0308010C:digital envelope routines::unsupported"`, then before running any `npm run` commands, run `set NODE_OPTIONS=--openssl-legacy-provider` in Command Prompt on Windows or `export NODE_OPTIONS=--openssl-legacy-provider` on Linux. 

# Contribute ⌨️

There are a lot of ways to contribute to Solar Tweaks:

- Fork the repository and make your own modifications and then open a [pull request](https://github.com/Solar-Tweaks/Solar-Tweaks/pulls)
- You can [submit bugs](https://github.com/Solar-Tweaks/Solar-Tweaks/issues)
- Help other users in our [Discussions page](https://github.com/orgs/Solar-Tweaks/discussions)
