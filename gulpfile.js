'use strict';

var gulp = require('gulp');
var replace = require('gulp-replace');
var wrench = require('wrench');
var sftp = require('gulp-sftp');
/**
 *  This will load all js or coffee files in the gulp directory
 *  in order to load all gulp tasks
 */
wrench.readdirSyncRecursive('./gulp').filter(function(file) {
  return (/\.(js|coffee)$/i).test(file);
}).map(function(file) {
  require('./gulp/' + file);
});

//165.227.2.220     192.168.1.103:3009
//46.101.175.101
gulp.task('local', function() {
  gulp.src(['./release/**/*.map', './release/**/*.js']).pipe(replace('localhost:3000', 'localhost')).pipe(gulp.dest('./release'));
//  gulp.src(['./release/**']).pipe(gulp.dest('c:\\xampp\\htdocs'));
});

gulp.task('remote', function () {
  gulp.src(['./release/**/*.map', './release/**/*.js']).pipe(replace('localhost:3009', 'www.whorub.com:3009')).pipe(gulp.dest('./release'));
});

gulp.task('upload', function () {
  gulp.src('./release/**').pipe(sftp({host: '46.101.175.101', remotePath: '/var/www/html/', user: 'root', pass: 'qlalfdkagh2015'}));
});

gulp.task('default', ['clean'], function () {
  gulp.start('build');
});