var gulp = require('gulp'),
	autoprefixer = require('gulp-autoprefixer'),
	beeper = require('beeper'),
	gulpCopy = require('gulp-copy'),
	sassGlob = require('gulp-sass-glob'),
	imagemin = require('gulp-imagemin'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	uglify = require('gulp-uglify'),
	svgSymbols = require('gulp-svg-symbols'),
	cssImport = require('css-import'),
	cssmqpacker = require('css-mqpacker'),
	csswring = require('csswring'),
	pngquant = require('imagemin-pngquant'),
	notify = require('gulp-notify'),
	del = require('del'),
	runSequence = require('run-sequence'),
	browserSync = require('browser-sync').create(),
	reload = browserSync.reload,
	rename = require("gulp-rename");





/*------------------------------------*\
	#OPTIONS
\*------------------------------------*/

var paths = {
	source: {
		styles: './source/styles/**/*.scss',
		images: './source/images/*',
		icons: './source/svg-icons/*.svg',
		scripts: './source/scripts/*.js'
	},
	dist: {
		styles: './public/styles',
		images: './public/images',
		icons: './public/images',
		scripts: './public/scripts'
	},
	patternLibrary: {
		patterns: ['pattern-library/**/*.html', 'pattern-library/**/*.md', 'pattern-library/data.json'],
		styles: './pattern-library/assets/css',
		images: './pattern-library/assets/images',
		scripts: './pattern-library/assets/js'
	}
};





/*------------------------------------*\
	#ERRORS
\*------------------------------------*/

function onError(err) {
	notify({
		title: 'Task failed',
		message: 'See the terminal for details.',
	}).write(err);
	beeper();
	console.log(err.toString());
	if (watching) {
		this.emit('end');
	} else {
		process.exit(1);
	}
}





/*------------------------------------*\
	#IMAGES
\*------------------------------------*/

gulp.task('images', function(callback) {
	runSequence('clean-images', ['imagemin', 'shapes'], callback);
});

// Remove old images
gulp.task('clean-images', function() {
	return del([ paths.dist.images ]);
});

// Minify
gulp.task('imagemin', function () {
	return gulp.src(paths.source.images)
	.pipe(imagemin({
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
		use: [pngquant()]
	}))
	.pipe(gulp.dest(paths.patternLibrary.images))
	.pipe(gulp.dest(paths.dist.images));
});





/*------------------------------------*\
	#SVGS
\*------------------------------------*/

// build svg shapes
gulp.task('shapes', function () {
	return gulp.src(paths.source.icons)
	.pipe(svgSymbols({
		id: 'icon-%f', // Prepend icon ID with 'icon-'. This is to avoid conflicts with generic IDs like `id="home"`
		templates: ['default-svg'],
		title: '%f', // Set a default title attribute that is the same as the file name
		slug: function (name) {
			return name.toLowerCase().trim().replace(/\s/g, '-');
		}
	}))
	.pipe(gulp.dest(paths.patternLibrary.images)) // Add copy to the pattern library
	.pipe(gulp.dest(paths.dist.images)); // Add copy to public directory
});





/*------------------------------------*\
	#SCRIPTS
\*------------------------------------*/

gulp.task('scripts', function() {
	return gulp.src(paths.source.scripts)
	.pipe(sourcemaps.init()) // Start source maps
	.pipe(uglify().on('error', onError)) // Minify
    .pipe(rename({ suffix: ".min" })) // Rename with '.min'
	.pipe(sourcemaps.write('/')) // Finish source maps
	.pipe(gulp.dest(paths.dist.scripts)) // Add copy to public directory
	.pipe(gulp.dest(paths.patternLibrary.scripts)) // Add copy to the pattern library
	.pipe(reload({ stream: true }));
});





/*------------------------------------*\
	#SERVER
\*------------------------------------*/

gulp.task('serve', ['styles'], function() {
	browserSync.init({
		server: './pattern-library'
	});

	gulp.watch(paths.source.styles, ['styles']).on('change', reload);
	gulp.watch(paths.source.patterns).on('change', reload);
});





/*------------------------------------*\
	#STYLES
\*------------------------------------*/

gulp.task('styles', function () {
	return gulp.src(paths.source.styles)
		.pipe(sourcemaps.init()) // Start source maps
		.pipe(sassGlob())
		.pipe(sass({outputStyle: 'compressed'}).on('error', onError))
		.pipe(autoprefixer({
			browsers: ['last 5 versions'],
			cascade: false,
				// flexbox: 'no-2009'
			}))
		.pipe(rename({ suffix: ".min" })) // Rename with '.min'
		.pipe(sourcemaps.write('/')) // Finish source maps
		.pipe(gulp.dest(paths.dist.styles)) // Add copy to public directory
		.pipe(gulp.dest(paths.patternLibrary.styles)) // Add copy to the pattern library
		.pipe(reload({ stream: true }));
	});





/*------------------------------------*\
	#WATCH
\*------------------------------------*/

gulp.task('watch', function() {
	watching = true;
	gulp.watch(paths.source.styles, ['styles']);
	gulp.watch(paths.source.scripts, ['scripts']);
	gulp.watch(paths.source.icons, ['shapes']);
	gulp.watch(paths.source.images, ['images']);
});





/*------------------------------------*\
	#DEFAULT
\*------------------------------------*/

gulp.task('default', ['serve', 'watch']);