"use strict";

const gulp = require("gulp");
const git = require("gulp-git");
const path = require("path");
const typescript = require("typescript");
const ts = require("gulp-typescript");
const uglifyjs = require("uglify-js-harmony");
const minifier = require("gulp-uglify/minifier");
const source = require("vinyl-source-stream");
const del = require("del");
const browserify = require("browserify");
const gutil = require("gulp-util");
const _ = require("underscore");
const electron = require("gulp-atom-electron");
const vfs = require("vinyl-fs");
const shell = require("gulp-shell");
const product = require("./product.json");
const shrinkwrap = require("./shrinkwrap.json");

/*
 * Trusted_eSign | Trusted_Api
*/
const TARGET = "Trusted_eSign";
const ELECTRON_VERSION = "1.2.4";
let architecture;

const dependencies = Object.keys(shrinkwrap.dependencies);
const depsSrc = _.flatten(dependencies.map(d => [`node_modules/${d}/**`]));

const project = ts.createProject("tsconfig.json", { typescript });

gulp.task("set architecture x64", () => {
  architecture = "x64";
});

gulp.task("set architecture ia32", () => {
  architecture = "ia32";
});

gulp.task("clean", () => del(["build", "tmp", "tmp_app_build", "trusted-crypto"]));

gulp.task("compile", ["clean"], () => gulp.src([`src/${TARGET}/**/*.tsx`, `src/${TARGET}/**/*.ts`])
  .pipe(project())
  .pipe(gulp.dest("tmp")));

gulp.task("bundle", ["compile"], () => browserify("tmp/main.js")
  .bundle()
  .pipe(source(`bundle_${TARGET}.js`))
  .pipe(gulp.dest("tmp")));

gulp.task("minimize", ["bundle"], () => {
  const options = {
    preserveComments: "license"
  };

  return gulp.src([`tmp/bundle_${TARGET}.js`])
    .pipe(minifier(options, uglifyjs))
    .on("error", err => {
      gutil.log(gutil.colors.red("[Error]"), err.toString());
    })
    .pipe(gulp.dest(`resources/${TARGET}`));
});

gulp.task("resources copy", ["minimize"], () => gulp.src(["resources/**/**"])
    .pipe(gulp.dest(`./tmp_app_build/electron-${process.platform}-${architecture}`)));

gulp.task("module copy", ["resources copy"], () => gulp.src(depsSrc, { base: ".", dot: true })
    .pipe(gulp.dest(`./tmp_app_build/electron-${process.platform}-${architecture}/`)));

gulp.task("rebuild trusted-crypto", ["clean"], cb => {
  let task;

  git.clone("https://github.com/TrustedPlus/crypto.git", { args: "./trusted-crypto" }, err => {
    if (err) {
      gutil.log(gutil.colors.red("[Error]"), err.toString());
    } else {
      task = shell.task([
        `node-gyp rebuild --target=${ELECTRON_VERSION} --arch=${architecture} --dist-url=https://atom.io/download/electron`,
        "tsc"
      ], { cwd: path.join(`${process.cwd()}`, "trusted-crypto") });

      task(cb);
    }
  });
});

gulp.task("trusted-crypto copy", ["rebuild trusted-crypto"], () => gulp.src(["./trusted-crypto/**/**"])
    .pipe(gulp.dest(`./tmp_app_build/electron-${process.platform}-${architecture}/node_modules/trusted-crypto`)));

const config = {
  version: ELECTRON_VERSION,
  productAppName: product.nameLong,
  companyName: "Digt",
  copyright: "Copyright (C) 2017 Digt. All rights reserved",
  darwinIcon: "resources/Trusted_eSign/trusted-esign.icns",
  linuxExecutableName: product.applicationName,
  winIcon: "resources/Trusted_eSign/trusted-esign.ico",
  token: process.env.GITHUB_TOKEN || void 0
};

gulp.task("build electron", ["trusted-crypto copy", "module copy"], () => {
  const platform = process.platform;
  const arch = architecture;
  const opts = _.extend({}, config, { platform, arch, ffmpegChromium: true, keepDefaultApp: true });

  return gulp.src(`./tmp_app_build/electron-${process.platform}-${architecture}/**`)
    .pipe(electron(opts))
    .pipe(vfs.dest(`build/${ELECTRON_VERSION}/${process.platform}-${architecture}`));
});

gulp.task("cert copy", ["build electron"], () => gulp.src(["./resources/Trusted_eSign/cert1.crt", "./resources/Trusted_eSign/cert1.key"])
    .pipe(gulp.dest(`./build/${ELECTRON_VERSION}/${process.platform}-${architecture}`)));

gulp.task("x64", ["set architecture x64",
  "build electron",
  "cert copy"
]);

gulp.task("ia32", ["set architecture ia32",
  "build electron",
  "cert copy"
]);

gulp.task("default", [
  "x64"
]);
