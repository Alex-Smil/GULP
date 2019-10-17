// *****************************************************
// ***** Данная конфигурация написана для GULP 4.0 *****
// ***************************************************** 
// npm i gulp-htmlmin gulp-notify gulp-sourcemaps gulp-concat gulp-babel @babel/core @babel/preset-env gulp-rename gulp-sass gulp-autoprefixer gulp-clean-css del browser-sync --save-dev

let gulp         = require('gulp'),
    notify       = require('gulp-notify'),
    htmlMin      = require('gulp-htmlmin'),
    concat       = require('gulp-concat'),
    babel        = require('gulp-babel'), // Вместо terserJs
    rename       = require('gulp-rename'),
    sass         = require('gulp-sass'),
    sourcemaps   = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    cleancss     = require('gulp-clean-css'),
    delFiles     = require('del'),
    BS           = require('browser-sync').create();

// html 
function htmlHandler() {
    return gulp.src(['src/**/*.html']) // откуда
                .pipe(htmlMin({collapseWhitespace: true})) // Помещаем файл(ы) в поток (в трубу), опция collapseWhitespace: true - убрать все пробелы
                .pipe(gulp.dest('./build')); // куда 
}

// sass
function sassHandler() {
    return gulp.src('src/style/**/*.scss') // откуда
                // вместо concat-sass добавил '_' underscore к имени файлов в папке blocks , с ним файлы не компелируются, т.е. sass() их не затрагивает, все тянется из main.scss
                .pipe(sourcemaps.init()) // инициализируем создание Source Maps
                .pipe(sass().on("error", notify.onError())) // компилируем файл .css
                .pipe(gulp.dest('src/style/')) // Сохраняем dev версию, потом опять берем
                .pipe(sass({ outputStyle: 'compressed' }).on("error", notify.onError())) // компилируем сжатый файл .css
                .pipe(rename({ suffix: '.min', prefix : '' })) // переименовываем файл в .min.css
                .pipe(autoprefixer(['last 15 versions'])) // добавляем вендорные префиксы
                .pipe(cleancss( {level: { 1: { specialComments: 0 } } })) // удаляем все комментарии из кода
                .pipe(sourcemaps.write('./')) // пути для записи SourceMaps
                .pipe(gulp.dest('build/css/')); // Сохраняем min версию 
}

// JS
function jsHandler() {
    return gulp.src('src/js/**/*.js') // откуда
                .pipe(sourcemaps.init())
                .pipe(babel({
                    presets: ['minify']
                }))
                .pipe(concat('bundle.js')) // Склейка файлов в один, all.js - имя на выходе
                .pipe(rename({suffix: '.min'}))
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest('build/js/'));
}

// Clear /dist dir
function clearDir() {
    return delFiles.sync(['build/']);
}

// Автоперезапуск вкладки, task для севрвера
function server() {
    BS.init({
        server: {
                baseDir: 'build/'
        }
    });

    // В одной строке отслеживаем все изменения который повлекут перезагрузку страницы
    BS.watch(['src/*.html', 'src/js/**/*.js', 'src/style/**/*.scss']).on('change', function() {
        BS.reload({stream: false});
    }); 
}

// watch
function watchFiles() {
    gulp.watch(['src/*.html'], htmlHandler);
    gulp.watch('src/js/**/*.js', jsHandler);
    gulp.watch('src/style/**/*.scss', sassHandler);
}

// Вместо task default делаем экспорт модулей, чтобы gulp увидел методы 
exports.htmlHandler = htmlHandler;
exports.jsHandler = jsHandler;
exports.sassHandler = sassHandler;
exports.clearDir = clearDir;
exports.watchFiles = watchFiles;
exports.server = server;

exports.default = gulp.parallel(
    
    htmlHandler, 
    jsHandler, 
    sassHandler, 
    watchFiles, 
    server,
    clearDir
);