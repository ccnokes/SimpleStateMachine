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
				src: ['src/State.js', 'src/StateMachine.js'],
				options: {
					specs: 'test/specs/*.js'
				}
			}
		},

		jshint: {
			files: {
				src: ['src/State.js', 'src/StateMachine.js']
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
				dest: 'dist/simple-state-machine.min.js'
			}
		},

		uglify: {
			options: {
				banner: banner
			},
			target: {
				files: {
					'dist/simple-state-machine.min.js': 'dist/simple-state-machine.min.js'
				}
			}
		},

		watch: {
			scripts: {
				files: ['src/*.js', 'examples/js/*'],
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
						connect.static(require('path').resolve('./dist')),
						connect.static(require('path').resolve('./examples'))
					];
				}
			}
		}
	});

	grunt.registerTask('default', [
		'concat',
		'uglify',
		'jshint',
		'watch:scripts'
	]);

	grunt.registerTask('build', [
		'concat',
		'uglify'
	]);

	grunt.registerTask('serve', [
		'concat',
		'uglify',
		'connect'
	]);

	grunt.registerTask('test', [ 'jasmine' ]);

};