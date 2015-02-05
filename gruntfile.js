var banner = '/** \n' + 
			 '* <%= pkg.name %> \n' +
			 '* @version <%= pkg.version %> \n' + 
			 '* @link <%= pkg.repository.url %> \n' + 
			 '* @author <%= pkg.author %> \n' +
			 '* @license <%= pkg.license %> \n' + 
			 '*/ \n';

module.exports = function(grunt) {
	
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		jasmine: {
			all: {
				src: ['dist/simple-state-machine.js'],
				options: {
					helpers: ['test/custom-matchers.js'],
					specs: 'test/specs/*.js'
				}
			}
		},

		jshint: {
			files: {
				src: ['*.js']
			}
		},

		concat: {
			files: {
				src: [
					'src/header.js',
					'src/State.js',
					'src/StateMachine.js',
					'src/main.js'
				],
				dest: 'dist/simple-state-machine.js'
			}
		},

		uglify: {
			options: {
				banner: banner
			},
			target: {
				files: {
					'dist/simple-state-machine.js': 'dist/simple-state-machine.js'
				}
			}
		},

		watch: {
			scripts: {
				files: ['src/*.js'],
				tasks: ['concat', 'uglify']
			},
			tests: {
				files: ['src/*.js', 'test/**/*.js'],
				tasks: ['concat', 'jasmine']
			}
		},

		connect: {
			server: {
				options: {
					port: 9000,
					keepalive: true,
					hostname: 'local.ssm.com',
				},
				//adds "access control *" header so our assets can be grabbed from other URLs
				middleware: function(connect, options) {
					return [
						function(req, res, next) {
							res.setHeader('Access-Control-Allow-Origin', '*');
							// don't just call next() return it
							return next();
						},
						// sets root directory to dist folder
						connect.static(require('path').resolve('./dist'))
					];
				}
			}
		}
	});

	grunt.registerTask('default', [
		'concat',
		'uglify',
		'watch:scripts'
	]);

};