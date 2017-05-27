var gulp     = require('gulp'),
		pug          = require('gulp-pug'),
		browsersync  = require('browser-sync'),
		concat       = require('gulp-concat'),
		uglify       = require('gulp-uglifyjs'),
		cssnano      = require('gulp-cssnano'),
		rename       = require('gulp-rename'),
		del          = require('del'),
		imagemin     = require('gulp-imagemin'),
		pngquant     = require('imagemin-pngquant'),
		sass         = require('gulp-sass'),
		cache        = require('gulp-cache'),
		spritesmith  = require('gulp.spritesmith');
		plumber      = require("gulp-plumber"),
		notify       = require("gulp-notify"),
		newer        = require("gulp-newer"),
		autoprefixer = require('gulp-autoprefixer'),
		path         = require('path');

//Pug
gulp.task('pug', function(){
	return gulp.src('app/pug/page/*.pug')
	.pipe(plumber())
	.pipe(pug({
		pretty: true
	}))
	.on("error" ,notify.onError(function(error) {
		return "Message to the notifier: " + error.message;
	}))
	.pipe(gulp.dest('app'));
});

// Sass
gulp.task('sass', function() {
	return gulp.src('app/static/sass/**/*.sass')
	.pipe(plumber())
	.pipe(sass({
		'include css': true,
		outputStyle: 'expanded'
	}))
	
	.on("error", notify.onError(function(error) {
		return "Message to the notifier: " + error.message;
	}))
	.pipe(autoprefixer(['last 2 version']))
	.pipe(gulp.dest('app/static/css/'))
	.pipe(browsersync.reload({
		stream: true
	}));
});

//Browsersync 
gulp.task('browsersync', function(){
	browsersync({
		server: {
			baseDir: 'app'
		},
	});
});

//JS
gulp.task('scripts', function() {
	return gulp.src([
		// Библиотеки
		'app/static/libs/**/*.js',
		])
	.pipe(concat('libs.min.js'))
	.pipe(uglify())
	.pipe(gulp.dest('app/static/libs/'))
	.pipe(browsersync.reload({
		stream: true
	}));
});

// Сборка спрайтов PNG
gulp.task('cleansprite', function() {
	return del.sync('app/static/img/sprite/sprite.png');
});


gulp.task('spritemade', function() {
	var spriteData =
	gulp.src('app/static/img/sprite/*.*')
	.pipe(spritesmith({
		imgName: 'sprite.png',
		imgPath: '../img/sprite/sprite.png',
		cssName: '_sprite.sass',
		padding: 10,
		cssFormat: 'sass',
		algorithm: 'binary-tree',
		cssVarMap: function(sprite) {
			sprite.name = 's-' + sprite.name;
		}
	}));

		spriteData.img.pipe(gulp.dest('app/static/img/sprite/')); // путь, куда сохраняем картинку
		spriteData.css.pipe(gulp.dest('app/static/sass/')); // путь, куда сохраняем стили
	});
gulp.task('sprite', ['cleansprite', 'spritemade']);


// Слежение
gulp.task('watch', ['browsersync', 'sass', 'scripts'], function() {
	gulp.watch('app/static/sass/**/*.sass', function () {
		setTimeout(function () {
		gulp.start('sass');
		}, 500);
	});
	gulp.watch('app/pug/**/*.pug', ['pug']);
	gulp.watch('app/*.html', browsersync.reload);
	gulp.watch(['app/static/js/*.js', '!app/static/js/libs.min.js', 'app/static/libs/jquery/jquery.js'], ['scripts']);
});

// Очистка папки сборки
gulp.task('clean', function() {
	return del.sync('prodact');
});

// Оптимизация изображений
gulp.task('img', function() {
	return gulp.src(['app/static/img/**/*', '!app/static/img/sprite/*'])
	.pipe(cache(imagemin({
		progressive: true,
		use: [pngquant()]

	})))
	.pipe(gulp.dest('product/static/img'));
});

// Сборка проекта

gulp.task('build', ['clean', 'img', 'sass', 'scripts'], function() {
	var buildCss = gulp.src('app/static/css/*.css')
	.pipe(gulp.dest('product/static/css'));

	var buildFonts = gulp.src('app/static/fonts/**/*')
	.pipe(gulp.dest('product/static/fonts'));

	var buildJs = gulp.src('app/static/js/*.js')
	.pipe(gulp.dest('product/static/js'));

	var buildHtml = gulp.src('app/*.html')
	.pipe(gulp.dest('product/'));

	var buildImg = gulp.src('app/static/img/sprite/sprite.png')
	.pipe(imagemin({
		progressive: true,
		use: [pngquant()]
	}))
	.pipe(gulp.dest('product/static/img/sprite/'));
});

// Очистка кеша
gulp.task('clear', function() {
	return cache.clearAll();
});

// Дефолтный таск
gulp.task('default', ['watch']);
