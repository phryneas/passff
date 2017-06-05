module.exports = function (grunt) {
  grunt.initConfig({
    ts: {
      built: {
        src: [
          "./src/**/*.ts",
          "./src/**/*.js",
          "./content/*.js",
        ],
        outDir: "./built/ts",
        options: {
          "rootDir": "./src",
          "noImplicitAny": true,
          "target": "es5",
          "allowJs": true,
          "lib": [
            "dom",
            "es6",
            "es2017"
          ]
        }
      },
    },
    browserify: {
      built: {
        files: {
          "./built/background.js": "built/ts/background.js",
          "./built/content/popup.js": "built/ts/content/popup.js",
          "./built/content/newPasswordWindow.js": "built/ts/content/newPasswordWindow.js",
          "./built/content/preferencesWindow.js": "built/ts/content/preferencesWindow.js",
        },
        options: {
          browserifyOptions: {
            debug: false //  true for sourcemaps
          },
        }
      },
    },
    compress: {
      'xpi': {
        options: {
          archive: './bin/passff.xpi',
          mode: 'zip'
        },
        files: [
          {
            expand: true,
            cwd: './src/',
            src: [
              'manifest.json',
              'icon.png',
              '_locales/**/*',
              'content/**/*',
              'skin/**/*'
            ],
          },
          {
            expand: true,
            cwd: './built/',
            src: [
              'background.js',
              'content/*.js'
            ],
          },
        ]
      }
    },
    watch: {
      scripts: {
        files: ["./src/**/*.ts", "./src/**/*.js"],
        tasks: ["build"]
      },
    },
  });

  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-contrib-compress");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["watch"]);
  grunt.registerTask("build", ["ts:built", "browserify:built", "compress:xpi"]);
};