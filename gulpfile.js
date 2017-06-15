const gulp = require('gulp')
const fs = require('fs')
const del = require('del')
const pug = require('gulp-pug')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const browsersync = require('browser-sync').create()
const sasslint = require('gulp-sass-lint')
const cleancss = require('gulp-clean-css')
const rename = require('gulp-rename')

/* Helper functions
---------------------------------------------------------------- */

// function getData () {
//     return JSON.parse(fs.readFileSync('src/data/recipes.json', 'utf-8'))
// }


/* Supporting tasks
---------------------------------------------------------------- */

gulp.task('clean', (done) => {
    return del('dist', done)
})

gulp.task('html', () => {
    return gulp.src(['src/html/**/*.pug', '!src/html/**/_*.pug'])
        // .pipe(pug({ data: getData() }))
        .pipe(pug({
            data: {
                root: '/'
            }
        }))
        .pipe(gulp.dest('dist'))
})

gulp.task('css', () => {
    return gulp.src('src/styles/main.sass')
        .pipe(sass().on('error', sass.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest('dist/styles'))
        .pipe(browsersync.stream())
})

gulp.task('serve', () => {
    browsersync.init({
        server: {
            baseDir: './dist'
        },
        port: 3333,
        notify: false,
        open: false
    })
})

gulp.task('reload', (done) => {
    browsersync.reload()
    done()
})


/* Watch tasks
---------------------------------------------------------------- */

gulp.task('watch:html', () => {
    gulp.watch('src/html/**/*', gulp.series('html', 'reload'))
})

gulp.task('watch:styles', () => {
    gulp.watch('src/styles/**/*', gulp.series('css'))
})

gulp.task('watch', gulp.parallel('watch:html', 'watch:styles'))


/* Minify/production tasks
---------------------------------------------------------------- */

gulp.task('minify:css', () => {
    return gulp.src('dist/styles/main.css')
        .pipe(cleancss())
        .pipe(gulp.dest('dist/styles'))
})


/* Lint tasks
---------------------------------------------------------------- */

gulp.task('lint:sass', () => {
    const opts = {
        configFile: './sass-lint.yml'
    }
    return gulp.src('src/styles/**/*.s+(a|c)ss')
        .pipe(sasslint(opts))
        .pipe(sasslint.format())
        .pipe(sasslint.failOnError())
})


/* Primary tasks
---------------------------------------------------------------- */

gulp.task('build', gulp.series('clean', gulp.parallel('html', 'css')))

gulp.task('default', gulp.series('build', gulp.parallel('serve', 'watch')))

gulp.task('minify', gulp.series('css', 'minify:css'))
