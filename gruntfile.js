module.exports = function(grunt) {
	
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		
		jasmine: {
			all: {
				src: ['simple-state-machine.js'],
				options: {
					specs: 'test/*.js'
				}
			}
		},

		jshint: {
			files: {
				src: ['*.js']
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
						connect.static(require('path').resolve('./src'))
					];
				}
			}
		}
	});

};