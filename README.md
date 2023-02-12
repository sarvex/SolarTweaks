![Banner](https://i.imgur.com/vgsmtcI.png)

# Solar Tweaks

![GitHub](https://img.shields.io/github/license/Solar-Tweaks/Solar-Tweaks?style=for-the-badge)
![GitHub all releases](https://img.shields.io/github/downloads/Solar-Tweaks/Solar-Tweaks/total?style=for-the-badge)
![GitHub package.json version](https://img.shields.io/github/package-json/version/Solar-Tweaks/Solar-Tweaks?style=for-the-badge)
![Maintenance](https://img.shields.io/maintenance/yes/2023?style=for-the-badge)

Solar Tweaks is a tweaking tool for Lunar Client, offering a wide range of modifications, including the ability to use mods which are unavailable by default. We are dedicated to providing our users with the most up-to-date patches and updates, and we are proud to have a large user base of over 200,000 individuals who have downloaded and used our tool.

Please note that the use of Solar Tweaks is at your own risk. Any changes done to the source code of Lunar Client is in violation of their terms of service. We advise you to review Lunar Client's terms of service by clicking [here](https://www.lunarclient.com/terms) before proceeding. We cannot be held responsible for any damages that may occur as a result of using Solar Tweaks.

# Installing

You can download the latest version of Solar Tweaks from the [Releases](https://github.com/Solar-Tweaks/Solar-Tweaks/releases) page. You need to download the version corresponding to your operating system (OS). You are able to find a more in depth explanation on how to download [here](https://github.com/Solar-Tweaks/Solar-Tweaks/wiki/Download-Solar-Tweaks).

# Usage

Launching the app will present with a user interface that closely resembles the original Lunar Client Launcher. This design choice has been implemented to ensure a seamless transition for users who may wish to switch between the two launchers, reducing confusion and improving ease of use. If you have never used Lunar Client and Solar Tweaks before, visit our [Documentation](https://docs.solartweaks.com) page and Lunar Client's [Support](https://support.lunarclient.com) page.

**Please note that Solar Tweaks is not a replacement for Lunar Client. Solar Tweaks is a tweaking tool for Lunar Client**

Customize and personalize your Lunar Client experience by navigating to the **"Engine"** tab within the app. Additionally, the **"Settings"** tab allows for customization of launcher and JRE preferences. The game can be launched at any time by utilizing the green launch button, which is accessible from any tab.

# Building from source

Solar Tweaks is fully open-source, allowing for users to obtain the source code and make their own modifications. To do so, the repository can be cloned using the command:
```bash
$ git clone https://github.com/Solar-Tweaks/Solar-Tweaks.git
```
Once the repository is downloaded, navigate to the directory and install the necessary dependencies using the commands:
```bash
$ cd Solar-Tweaks
$ npm install
```
For development purposes, run this command to build the app and start it. Hot reload is included for easier development and testing.
```bash
$ npm run serve
```
To build the final version of the app, run this command. The resulting executables, installers, etc. will be located in the dist directory.
```bash
$ npm run build
```

**Note:** If you are a receiving an error like this `"error:0308010C:digital envelope routines::unsupported"`, then before running any `npm run` commands, run `set NODE_OPTIONS=--openssl-legacy-provider` in Command Prompt on Windows or `export NODE_OPTIONS=--openssl-legacy-provider` on Linux. 

# Contribute

There are lots of ways to contribute to Solar Tweaks:

- Fork the repository and make your own modifications, then open a [Pull request](https://github.com/Solar-Tweaks/Solar-Tweaks/pulls).
- If you encounter any glitches or bugs, submit them in [Issues page](https://github.com/Solar-Tweaks/Solar-Tweaks/issues).
- Help people that are having issues in [Discussions page](https://github.com/orgs/Solar-Tweaks/discussions).
