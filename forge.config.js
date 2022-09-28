/**
 * @type {import("@electron-forge/shared-types").ForgeConfig}
 */
module.exports = {
  packagerConfig: {
      icon: "Assets/Electunes",
  },
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      /**
       * @type {import("@electron-forge/maker-squirrel").MakerSquirrelConfig}
       */
      config: {
        iconUrl: "./Assets/Electunes.ico",
        setupIcon: "./Assets/Electunes.ico"
      }
    },
    {
      name: "@electron-forge/maker-dmg",
      /**
       * @type {import("@electron-forge/maker-dmg").MakerDMGConfig}
       */
      config: {
        icon: "Assets/Electunes.icns"
      },
    },
    {
      name: "@electron-forge/maker-deb",
      /**
       * @type {import("@electron-forge/maker-deb").MakerDebConfig}
       */
      config: {
        options: {
          icon: "Assets/Electunes.png"
        }
      }
    },
    {
      name: "@electron-forge/maker-rpm",
      /**
       * @type {import("@electron-forge/maker-rpm").MakerRpmConfig}
       */
      config: {
        options: {
          icon: "Assets/Electunes.png"
        }
      }
    }
  ]
}