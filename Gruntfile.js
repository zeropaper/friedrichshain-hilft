'use strict';
/*jshint node:true*/
module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  var setup = grunt.file.readJSON(__dirname + '/package.json').setup;

  setup.target = process.env.THEME_TARGET || setup.target;
  setup.source = process.env.THEME_SOURCE || setup.source;

  grunt.initConfig({
    setup: setup,

    copy: {
      themeInfo: {
        files: [{
          expand: true,
          src: ['<%= setup.source %>/theme.toml', 'LICENSE'],
          dest: '<%= setup.target %>/'
        }]
      },
      bootstrapFonts: {
        files: [{
          cwd: 'node_modules/camunda-commons-ui/node_modules/bootstrap/fonts/',
          expand: true,
          src: ['**/*'],
          dest: '<%= setup.target %>/static/fonts/'
        }]
      },
      themeFonts: {
        files: [{
          cwd: '<%= setup.source %>/static/fonts/',
          expand: true,
          src: ['**/*'],
          dest: '<%= setup.target %>/static/fonts/'
        }]
      },
      layouts: {
        files: [{
          cwd: '<%= setup.source %>/layouts/',
          expand: true,
          src: ['**/*'],
          dest: '<%= setup.target %>/layouts/'
        }]
      },
      img: {
        files: [{
          cwd: '<%= setup.source %>/img/',
          expand: true,
          src: ['**/*'],
          dest: '<%= setup.target %>/static/img/'
        }]
      }
    },

    less: {
      options: {
        dumpLineNumbers: 'all',
        paths: ['node_modules']
      },
      styles: {
        files: [{
          src: ['<%= setup.source %>/styles/styles.less'],
          dest: '<%= setup.target %>/static/css/styles.css'
        }]
      }
    },

    browserify: {
      scripts: {
        files: [{
          src: ['<%= setup.source %>/scripts/index.js'],
          dest: '<%= setup.target %>/static/js/scripts.js'
        }]
      }
    },

    watch: {
      layouts: {
        files: ['<%= setup.source %>/layouts/**/*'],
        tasks: ['copy:layouts']
      },
      styles: {
        files: ['<%= setup.source %>/styles/**/*.less'],
        tasks: ['less:styles']
      },
      scripts: {
        files: ['<%= setup.source %>/scripts/**/*.js'],
        tasks: ['browserify:scripts']
      }
    },

    cssmin: {
      styles: {
        files: [{
          src: '<%= setup.target %>/static/css/styles.css',
          dest: '<%= setup.target %>/static/css/styles.css'
        }]
      }
    },

    uglify: {
      scripts: {
        files: [{
          src: '<%= setup.target %>/static/js/scripts.js',
          dest: '<%= setup.target %>/static/js/scripts.js'
        }]
      }
    },

    // -----------------------------------------------

    clean: ['.tmp'],

    gitclone: {
      dist: {
        options: {
          directory: '.tmp',
          repository: 'git@github.com:zeropaper/fhilft-hugo-theme.git',
        }
      }
    },

    gitcheckout: {
      dist: {
        options: {
          cwd: '.tmp',
          branch: 'dist'
        }
      }
    },

    gitadd: {
      dist: {
        options: {
          cwd: '.tmp',
          all: true
        }
      }
    },

    gitcommit: {
      dist: {
        options: {
          cwd: '.tmp',
          message: 'chore(update): publish new version of theme',
          noStatus: true,
          allowEmpty: true
        }
      }
    },

    gitpush: {
      dist: {
        options: {
          cwd: '.tmp',
          remote: 'origin',
          branch: 'dist'
        }
      }
    }
  });

  grunt.registerTask('build', ['copy', 'less:styles', 'browserify:scripts']);

  grunt.registerTask('optimize', [
    'uglify:scripts',
    'cssmin:styles'
  ]);

  grunt.registerTask('publish', function () {
    grunt.config.set('setup.target', '.tmp');
    grunt.config.set('setup.minify', true);

    grunt.task.run([
      'clean',
      'gitclone:dist',
      'gitcheckout:dist',
      'build',
      'optimize',
      'gitadd:dist',
      'gitcommit:dist',
      'gitpush:dist'
    ]);
  });

  grunt.registerTask('default', ['build', 'watch']);
};
