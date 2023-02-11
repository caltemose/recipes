const gulp = require('gulp')
const fs = require('fs')
const path = require('path')
// const del = require('del')
const clean = require('gulp-clean')
const gulpData = require('gulp-data')
const foreach = require('gulp-foreach')
const pug = require('gulp-pug')
const sass = require('gulp-sass')(require('sass'))
const autoprefixer = require('gulp-autoprefixer')
const browsersync = require('browser-sync').create()
const sasslint = require('gulp-sass-lint')
const cleancss = require('gulp-clean-css')
const rename = require('gulp-rename')
const ghPages = require('gulp-gh-pages')
const environments = require('gulp-environments')

const production = environments.production
const development = environments.development


/* Helper functions
---------------------------------------------------------------- */

function getJsonFile (file) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'))
}

function getJsonFileAlphabetical (file) {
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'))
    // data.recipes[ {id, label, slug, core} ]
    const updated = { recipes: {} }
    const letterString = 'abcdefghijklmnopqrstuvwxyz'
    const letters = letterString.split('')
    for(let i=0; i<letters.length; i++) {
        updated.recipes[letters[i]] = []
    }
    for(let i=0; i<data.recipes.length; i++) {
        const initial = data.recipes[i].label[0]
        updated.recipes[initial.toLowerCase()].push(data.recipes[i])
    }
    for(let i=0; i<letters.length; i++) {
        if (updated.recipes[letters[i]].length < 1) {
            delete updated.recipes[letters[i]]
        }
    }
    return updated
}

function getJsonData (file) {
    return require(file.path)
}

function getRoot () {
    return production() ? '/recipes/' : '/'
}

/* Supporting tasks
---------------------------------------------------------------- */

gulp.task('clean', (done) => {
    // return del('dist', done)
    return gulp.src('dist', {read: false, allowEmpty: true})
        .pipe(clean());

})

gulp.task('html', () => {
    return gulp.src(['src/html/**/*.pug', '!src/html/**/_*.pug'])
        // .pipe(pug({ data: getData() }))
        .pipe(pug({
            data: {
                root: getRoot()
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

gulp.task('templates-recipes', function() {
    return gulp.src(['data/recipes/*.json', '!data/recipes/index.json'])
        .pipe(foreach(function (stream, file) {
            var jsonFile = file
            var jsonBasename = path.basename(jsonFile.path, path.extname(jsonFile.path))
            return gulp.src('src/html/recipes/_recipe.pug')
                .pipe(gulpData(getJsonData(jsonFile)))
                .pipe(pug({
                    data: {
                        root: getRoot()
                    }
                }))
                .pipe(rename(function(htmlFile) {
                    htmlFile.basename = jsonBasename
                }))
            .pipe(gulp.dest('dist/recipes'))
        })
    )
})

gulp.task('templates-tags', function() {
    return gulp.src(['data/tags/*.json', '!data/tags/index.json'])
        .pipe(foreach(function (stream, file) {
            var jsonFile = file
            var jsonBasename = path.basename(jsonFile.path, path.extname(jsonFile.path))
            return gulp.src('src/html/tags/_tag.pug')
                .pipe(gulpData(getJsonData(jsonFile)))
                .pipe(pug({
                    data: {
                        root: getRoot()
                    }
                }))
                .pipe(rename(function(htmlFile) {
                    htmlFile.basename = jsonBasename
                }))
            .pipe(gulp.dest('dist/tags'))
        })
    )
})

gulp.task('templates-collections', function() {
    return gulp.src(['data/collections/*.json', '!data/collections/index.json'])
        .pipe(foreach(function (stream, file) {
            var jsonFile = file
            var jsonBasename = path.basename(jsonFile.path, path.extname(jsonFile.path))
            return gulp.src('src/html/collections/_collection.pug')
                .pipe(gulpData(getJsonData(jsonFile)))
                .pipe(pug({
                    data: {
                        root: getRoot()
                    }
                }))
                .pipe(rename(function(htmlFile) {
                    htmlFile.basename = jsonBasename
                }))
            .pipe(gulp.dest('dist/collections'))
        })
    )
})

gulp.task('index-recipes', () => {
    return gulp.src('src/html/recipes/_index.pug')
        .pipe(gulpData(getJsonFileAlphabetical('data/recipes/index.json')))
        .pipe(pug({
            data: {
                root: getRoot()
            }
        }))
        .pipe(rename(function(htmlFile) {
            htmlFile.basename = 'index'
        }))
        .pipe(gulp.dest('dist/recipes/'))
})

gulp.task('index-tags', () => {
    return gulp.src('src/html/tags/_index.pug')
        .pipe(gulpData(getJsonFile('data/tags/index.json')))
        .pipe(pug({
            data: {
                root: getRoot()
            }
        }))
        .pipe(rename(function(htmlFile) {
            htmlFile.basename = 'index'
        }))
        .pipe(gulp.dest('dist/tags/'))
})

gulp.task('index-collections', () => {
    return gulp.src('src/html/collections/_index.pug')
        .pipe(gulpData(getJsonFile('data/collections/index.json')))
        .pipe(pug({
            data: {
                root: getRoot()
            }
        }))
        .pipe(rename(function(htmlFile) {
            htmlFile.basename = 'index'
        }))
        .pipe(gulp.dest('dist/collections/'))
})

gulp.task('indices', gulp.parallel('index-tags', 'index-recipes', 'index-collections'))

gulp.task('deploy:ghpages', () => {
    return gulp.src('./dist/**/*')
        .pipe(ghPages());
});

/* Watch tasks
---------------------------------------------------------------- */

gulp.task('watch:html', () => {
    gulp.watch('src/html/**/*', gulp.series('html', 'reload'))
})

gulp.task('watch:styles', () => {
    gulp.watch('src/styles/**/*', gulp.series('css'))
})

gulp.task('watch:templates-recipes', () => {
    gulp.watch('src/html/recipes/_recipe.pug', gulp.series('templates-recipes'))
})

gulp.task('watch:templates-tags', () => {
    gulp.watch('src/html/tags/_tag.pug', gulp.series('templates-tags'))
})

gulp.task('watch:templates-collections', () => {
    gulp.watch('src/html/collections/_collection.pug', gulp.series('templates-collections'))
})

gulp.task('watch:index:tags', () => {
    gulp.watch('src/html/tags/_index.pug', gulp.series('index-tags'))
})

gulp.task('watch:index:recipes', () => {
    gulp.watch('src/html/recipes/_index.pug', gulp.series('index-recipes'))
})

gulp.task('watch:index:collections', () => {
    gulp.watch('src/html/collections/_index.pug', gulp.series('index-collections'))
})

gulp.task('watch', gulp.parallel('watch:html', 'watch:styles', 'watch:templates-tags', 'watch:templates-recipes', 'watch:templates-collections', 'watch:index:tags', 'watch:index:recipes', 'watch:index:collections'))


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

gulp.task('build', gulp.series('clean', gulp.parallel('html', 'templates-recipes', 'templates-tags', 'templates-collections', 'indices', 'css')))

gulp.task('default', gulp.series('build', gulp.parallel('serve', 'watch')))

gulp.task('minify', gulp.series('css', 'minify:css'))

gulp.task('deploy', gulp.series('build', 'minify', 'deploy:ghpages'))
