const gulp = require("gulp");
const cleanCss = require("gulp-clean-css");
const browserSync = require("browser-sync").create();
const autoprefixer = require("gulp-autoprefixer");
const babel = require("gulp-babel");
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");
const lineec = require("gulp-line-ending-corrector");
const imagemin = require("gulp-imagemin");
const minify = require("gulp-minify");

// Config
function style() {
  return gulp
    .src("./*.css")
    .pipe(sourcemaps.init({ loadMaps: true, largeFile: true }))
    .pipe(concat("style.min.css"))
    .pipe(autoprefixer("last 2 versions"))
    .pipe(cleanCss())
    .pipe(lineec())
    .pipe(gulp.dest("./dist/css"));
}

function javascript() {
  return gulp
    .src("./js/**/*.js")
    .pipe(concat("bundle.min.js"))
    .pipe(minify())
    .pipe(lineec())
    .pipe(gulp.dest("./dist/js"));
}

function images() {
  return gulp
    .src(["./images/*"])
    .pipe(imagemin())
    .pipe(gulp.dest("./dist/images"));
}
function images1() {
  return gulp
    .src(["./images/products/iphone/*"])
    .pipe(imagemin())
    .pipe(gulp.dest("./dist/images/products/iphone"));
}
function images2() {
  return gulp
    .src(["./images/products/sumsung/*"])
    .pipe(imagemin())
    .pipe(gulp.dest("./dist/images/products/sumsung"));
}
function images3() {
  return gulp
    .src(["./images/products/headphone/*"])
    .pipe(imagemin())
    .pipe(gulp.dest("./dist/images/products/headphone"));
}

function watch() {
  browserSync.init({
    server: {
      baseDir: "./",
    },
  });

  gulp.watch("./*.html").on("change", browserSync.reload);
  gulp.watch("./js/**/*.js", javascript).on("change", browserSync.reload);
  gulp.watch("./images/*", images1, images2, images3);
  gulp.watch("./*.css", style);
}

exports.style = style;
exports.javascript = javascript;
exports.watch = watch;
exports.images = images;
exports.images1 = images1;
exports.images2 = images2;
exports.images3 = images3;

var build = gulp.parallel(watch);
gulp.task("default", build);
