let gulp		=	require('gulp'),
    watch		=	require('gulp-watch'),
    sass		=	require('gulp-sass'),
    autoprfxr	=	require('gulp-autoprefixer'),
    cssmin		=	require('gulp-clean-css'),
    csscomb		=	require('gulp-csscomb'),
    imagemin	=	require('gulp-imagemin'),
    pngquant	=	require('imagemin-pngquant'),
    gcmq		=	require('gulp-group-css-media-queries'),
    concat		=	require('gulp-concat'),
    uglify 		= 	require('gulp-uglify'),
    smartgrid	=	require('smart-grid'),
    babel       =   require('gulp-babel'),
    bs 			=	require('browser-sync'),
    htmlmin     =   require('gulp-htmlmin'),
    fileinclude =   require('gulp-file-include'),
    sourcemaps  =   require('gulp-sourcemaps');
/*----------------------------------------------------*/
let path = {
    src: {
        html:       'src/*.html',
        sass: 		'src/sass/style.sass',
        img: 		'src/img/**/*.*',
        js: 		'src/js/**/*.js',
        fonts:      'src/fonts/*.+(ttf|otf)',

        vendor: {
            smartgrid: 'src/vendor/smart-grid'
        }
    },

    dist: {
        html:       'dist/',
        css: 		'dist/css/',
        img: 		'dist/img/',
        js:    		'dist/js/',
        fonts:    	'dist/fonts/',
    }
};

gulp.task('dev', ['all'], () => {
    bs.init({
        server: "dist/",
        notify: false,
        open: true,
        ui: false
    });

    gulp.watch('src/**/*.+(sass|scss)', ['sass']);
    gulp.watch('src/js/**/*.js', ['js']);
    gulp.watch('src/img/*.*', ['img']);
    gulp.watch('src/**/*.html', ['html']);
});

gulp.task('html', () => {
    gulp.src(path.src.html)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(gulp.dest(path.dist.html))
        .pipe(bs.stream());
});

gulp.task('sass', () => {
    gulp.src(path.src.sass)
        .pipe(sass({
            outputStyle: 'expanded'
        })).on('error', sass.logError)
        .pipe(autoprfxr({
            browsers: ['last 5 versions'],
            cascade: false
        }))
        .pipe(gcmq())
        .pipe(csscomb())
        .pipe(gulp.dest(path.dist.css))
        .pipe(bs.stream());
});

gulp.task('js', () => {
    gulp.src(path.src.js)
        .pipe(concat('main.js'))
        .pipe(gulp.dest(path.dist.js))
        .pipe(bs.stream());
});

gulp.task('fonts', () => {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest('dist/fonts/'));
});

gulp.task('libs', () => {
    gulp.src([
        'node_modules/jquery/dist/jquery.min.js'
    ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(path.dist.js))
        .pipe(bs.stream());
});

gulp.task('img', () => {
    gulp.src(path.src.img)
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.dist.img))
        .pipe(bs.stream());
});


gulp.task('all', ['html', 'sass', 'js', 'libs', 'fonts', 'img']);

gulp.task('smartgrid', () => {
    smartgrid(path.src.vendor.smartgrid, {
        outputStyle: 'sass',
        columns: 12,
        offset: '30px',
        mobileFirst: false,
        container: {
            maxWidth: '1200px',
            fields: '15px'
        },
        breakPoints: {
            lg: {
                width: '1200px'
            },
            md: {
                width: '991px'
            },
            sm: {
                width: '767px'
            },
            xs: {
                width: '575px'
            },
            xxs: {
                width: '320px'
            }
        }
    });
});

gulp.task('production', ['libs', 'img'], () => {
    gulp.src(path.src.html)
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(gulp.dest(path.dist.html));

    gulp.src(path.src.sass)
        .pipe(sass({
            outputStyle: 'expanded'
        })).on('error', sass.logError)
        .pipe(autoprfxr({
            browsers: ['last 5 versions'],
            cascade: false
        }))
        .pipe(gcmq())
        .pipe(csscomb())
        .pipe(cssmin())
        .pipe(gulp.dest(path.dist.css))
        .pipe(bs.stream());

    gulp.src(path.src.js)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('maps/'))
        .pipe(gulp.dest(path.dist.js));
    gulp.src(path.src.fonts)
        .pipe(gulp.dest('dist/fonts/'));
});