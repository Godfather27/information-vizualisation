/* eslint-disable */
module.exports = function(grunt) {
  grunt.initConfig({
    browserify: {
      dist: {
        options: {
          transform: [
            ["babelify", { presets: ["es2015"] }]
          ]
        },
        files: {
          "./dist/script/index.js": ["./src/scripts/index.js"]
        }
      }
    },
    sass: {
      options: {
        sourceMap: true
      },
      dist: {
        files: {
          './dist/style/style.css': './src/styles/index.scss'
        }
      }
    },
    copy: {
      main: {
        files: [{
          expand: true,
          cwd: 'src',
          src: ['**/*.{html,php}'],
          dest: 'dist/'
        }, {
          expand: true,
          cwd: 'src',
          src: ['assets/**/*'],
          dest: 'dist/'
        }]
      },
    },
    clean: ['./dist/**/*', './dest/**/*'],
    imagemin: {
      dynamic: {
        options: { // Target options
          optimizationLevel: 6,
          max: 60
        },
        files: [{
          expand: true,
          cwd: 'src', // Src matches are relative to this path
          src: ['**/*.{png,jpg,gif}'], // Actual patterns to match
          dest: 'dist/' // Destination path prefix
        }]
      }
    },
    watch: {
      scripts: {
        files: ["./src/scripts/**/*.js"],
        tasks: ["browserify"]
      },
      css: {
        files: ["./src/styles/**/*.scss"],
        tasks: ["sass"]
      },
      html: {
        files: ["./src/**/*.html", './src/**/*.php'],
        tasks: ["copy"]
      },
      assets: {
        files: ["./src/assets/**/*"],
        tasks: ["copy"]
      },
      images: {
        files: ["./src/**/*.{png,jpg,gif}"],
        tasks: ["imagemin"]
      },
      livereload: {
        // Here we watch the files the sass task will compile to
        // These files are sent to the live reload server after sass compiles to them
        options: { livereload: true },
        files: ['dist/**/*'],
      },
    }
  });

  grunt.loadNpmTasks("grunt-browserify");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-sass");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-imagemin');

  grunt.registerTask("default", ["copy", "browserify", "sass", "imagemin","watch"]);
  grunt.registerTask("build", ["copy", "browserify", "sass", "imagemin"]);
};
