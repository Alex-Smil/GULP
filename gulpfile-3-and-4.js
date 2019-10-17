
// *****************************************************
// ***** Данная конфигурация написана для GULP 4.0 *****
// ***************************************************** 

let gulp = require('gulp'),
    htmlMin = require('gulp-htmlmin'),
    concat = require('gulp-concat'),
    // uglifyJs = require('gulp-uglifyjs'), !!! WARN deprecated gulp-uglifyjs@0.6.2: Since gulp-sourcemaps now works, use gulp-uglify instead !!!
    // uglifyJs = require('gulp-uglify'), // Не работает с ES6
    terserJs = require('gulp-terser'),// Альтернатива gulp-uglify
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    autoPrefixer = require('gulp-autoprefixer'),
    cssMin = require('gulp-csso'),
    delFiles = require('del'),
    BS = require('browser-sync').create();

// html 
function html() {
    return gulp.src(['./app/html/**/*.html']) // откуда
                .pipe(htmlMin({collapseWhitespace: true})) // Помещаем файл(ы) в поток (в трубу), опция collapseWhitespace: true - убрать все пробелы
                .pipe(gulp.dest('./dist')); // куда 
}

// js
function js() {
    return gulp.src('./app/js/**/*.js') // откуда
                .pipe(concat('all.js')) // Склейка файлов в один, all.js - имя на выходе
                .pipe(gulp.dest('./dist/js')) // Сохраняем dev версию, потом опять берем
                .pipe(terserJs()) // Минификация JS ES6
                .pipe(rename({suffix: '.min'})) // Так делают все норм библ-ки, добав суффикс .min. 
                .pipe(gulp.dest('./dist/js')); // Сохраняем min версию 
}

// sass
function styleFunc() {
    return gulp.src('./app/styles/**/*.scss') // откуда
                // вместо concat-sass добавил '_' underscore к имени файлов в папке blocks , с ним файлы не компелируются, т.е. sass() их не затрагивает, все тянется из main.scss
                .pipe(sass()) // Преобразуем в CSS
                .pipe(autoPrefixer()) // Авто префиксы
                .pipe(gulp.dest('./dist/css')) // Сохраняем dev версию, потом опять берем
                .pipe(cssMin()) // Минификация JS
                .pipe(rename({suffix: '.min'})) // Так делают все норм библ-ки, добав суффикс .min. 
                .pipe(gulp.dest('./dist/css')); // Сохраняем min версию 
}

// Clear /dist dir
function clear() {
    return delFiles.sync(['./dist/*']);
}

// Автоперезапуск вкладки, task для севрвера
function server() {
    BS.init({
        server: {
                baseDir: './dist'
        }
    });

    // В одной строке отслеживаем все изменения который повлекут перезагрузку страницы
    BS.watch('./app/').on('change', function() {
        BS.reload({stream: false});
    }); 
}

// watch
function watchFiles() {
    gulp.watch(['./app/html/**/*.html'], html);
    gulp.watch('./app/js/**/*.js', js);
    gulp.watch('./app/styles/**/*.scss', styleFunc);
}

// Вместо task default делаем экспорт модулей, чтобы gulp увидел методы 
exports.html = html;
exports.js = js;
exports.styleFunc = styleFunc;
exports.clear = clear;
exports.watchFiles = watchFiles;
exports.server = server;

exports.default = gulp.parallel(html, js, styleFunc, watchFiles, server); // exports.clear = clear - убрал из списка так как удаляет JSON папку




// ***************************************************
// *******************  Gulp 3.9  ********************
// ***************************************************
// // html 
// gulp.task('html', function() {
//     gulp.src(['./app/html/**/*.html']) // откуда
//                 .pipe(htmlMin({collapseWhitespace: true})) // Помещаем файл(ы) в поток (в трубу), опция collapseWhitespace: true - убрать все пробелы
//                 .pipe(gulp.dest('./dist')); // куда 
// });

// // js
// gulp.task('js', function() {
//     gulp.src('./app/js/**/*.js') // откуда
//                 .pipe(concat('all.js')) // Склейка файлов в один, all.js - имя на выходе
//                 .pipe(gulp.dest('./dist/js')) // Сохраняем dev версию, потом опять берем
//                 .pipe(terserJs()) // Минификация JS
//                 .pipe(rename({suffix: '.min'})) // Так делают все норм библ-ки, добав суффикс .min. 
//                 .pipe(gulp.dest('./dist/js')); // Сохраняем min версию 
// });

// // sass
// gulp.task('styleFunc', function() {
//     gulp.src('./app/styles/**/*.scss') // откуда
//                 // вместо concat-sass добавил '_' underscore к имени файлов , с ним файлы не компелируются, т.е. sass() их не затрагивает.
//                 .pipe(sass()) // Преобразуем в CSS
//                 .pipe(autoPrefixer()) // Авто префиксы
//                 .pipe(gulp.dest('./dist/css')) // Сохраняем dev версию, потом опять берем
//                 .pipe(cssMin()) // Минификация JS
//                 .pipe(rename({suffix: '.min'})) // Так делают все норм библ-ки, добав суффикс .min. 
//                 .pipe(gulp.dest('./dist/css')); // Сохраняем min версию 
// });

// // // При частой пересборке проекта, папку dist надо чистить
// // // этот task помещаем в начало default
// // gulp.task('clear', function() {
// //     delFiles.sync(['./dist/*']);
// // });

// // Авто отслеживание изменений в проекте
// gulp.task('watch', function() {
//     gulp.watch(['./app/html/index.html'], ['html']);
//     gulp.watch('./app/js/**/*.js', ['js']);
//     gulp.watch('./app/sass/**/*.sass', ['styleFunc']);
// });

// // Автоперезапуск вкладки, task для севрвера
// gulp.task('server', function() {
//     BS({
//         server: {
//             baseDir: './dist/'
//         }
//     });
//     BS.watch('./app/').on('change', function() {
//         BS.reload({stream: false});
//     });
// });


// gulp.task('default', ['html', 'js', 'styleFunc', 'watch', 'server'], function() { // 'clear' - Удаляет JSON, пока без clear
//     console.log('Default is running!');
// });