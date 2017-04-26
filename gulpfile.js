"use strict";

var gulp = require("gulp");
var typescript = require("typescript");
var ts = require("gulp-typescript");
var uglifyjs = require("uglify-js-harmony");
var minifier = require("gulp-uglify/minifier");
var uglify = require("gulp-uglify");
var source = require("vinyl-source-stream");
var del = require("del");
var browserify = require("browserify");
var NwBuilder = require("nw-builder");
var gutil = require("gulp-util");
var electron = require("gulp-electron");
var packageJson = require("./resources/package.json");

var NWJS_VERSION = "0.14.6";
var ELECTRON_VERSION = "v1.2.4";

/*
 * Trusted_eSign | Trusted_Api
*/
var TARGET = "Trusted_eSign";

var electronPlatform;

var project = ts.createProject("tsconfig.json", { typescript: typescript });

gulp.task("clean", function() {
  return del(["build", "tmp", "tmp_app_build"]);
});

gulp.task("compile", ["clean"], function() {
  return gulp.src(["src/" + TARGET + "/**/*.tsx", "src/" + TARGET + "/**/*.ts", "typings/" + TARGET + "/**/*.d.ts"])
    .pipe(project())
    .pipe(gulp.dest("tmp"));
});

gulp.task("bundle", ["compile"], function() {
  return browserify("tmp/main.js")
    .bundle()
    .pipe(source("bundle_" + TARGET + ".js"))
    .pipe(gulp.dest("tmp"));
});

gulp.task("minimize", ["bundle"], function() {
  var options = {
    preserveComments: "license"
  };

  return gulp.src(["tmp/bundle_" + TARGET + ".js"])
    .pipe(minifier(options, uglifyjs))
    .on("error", function(err) {
      gutil.log(gutil.colors.red("[Error]"), err.toString());
    })
    .pipe(gulp.dest("resources/" + TARGET + ""));
});

gulp.task("no-minimize", ["bundle"], function() {
  return gulp.src(["tmp/bundle_" + TARGET + ".js"])
    .pipe(gulp.dest("resources/" + TARGET + ""));
});

gulp.task("CryptoARM (win64)", ["no-minimize"], function() {
  return gulp.src(["resources/" + TARGET + "/**/**", "node_modules_by_system/win64/**/**"])
    .pipe(gulp.dest("tmp_app_build/win64"));
});

gulp.task("trusted-crypto (win64) copy", ["CryptoARM (win64)"], function() {
  return gulp.src(["../trusted-crypto/win64/**/**"])
    .pipe(gulp.dest("tmp_app_build/win64/node_modules"));
});

gulp.task("CryptoARM (linux32)", ["minimize"], function() {
  return gulp.src(["resources/" + TARGET + "/**/**", "node_modules_by_system/linux32/**/**"])
    .pipe(gulp.dest("tmp_app_build/linux32"));
});

gulp.task("trusted-crypto (linux32) copy", ["CryptoARM (linux32)"], function() {
  return gulp.src(["../trusted-crypto/linux32/**/**"])
    .pipe(gulp.dest("tmp_app_build/linux32/node_modules"));
});

gulp.task("CryptoARM (linux64)", ["minimize"], function() {
  return gulp.src(["resources/" + TARGET + "/**/**", "node_modules_by_system/linux64/**/**"])
    .pipe(gulp.dest("tmp_app_build/linux64"));
});

gulp.task("trusted-crypto (linux64) copy", ["CryptoARM (linux64)"], function() {
  return gulp.src(["../trusted-crypto/linux64/**/**"])
    .pipe(gulp.dest("tmp_app_build/linux64/node_modules"));
});

gulp.task("nw linux64", ["CryptoARM (linux64)", "trusted-crypto (linux64) copy"], function() {
  var nw = new NwBuilder({
    version: NWJS_VERSION,
    files: "./tmp_app_build/linux64/**/**",
    cacheDir: "./cache",
    platforms: ["linux64"]
  });

  nw.on("log", function(msg) {
    gutil.log("nw-builder", msg);
  });

  return nw.build().catch(function(err) {
    gutil.log("nw-builder", err);
  });
});

gulp.task("nw linux32", ["CryptoARM (linux32)", "trusted-crypto (linux32) copy"], function() {
  var nw = new NwBuilder({
    version: NWJS_VERSION,
    files: "./tmp_app_build/linux32/**/**",
    cacheDir: "./cache",
    platforms: ["linux32"]
  });

  nw.on("log", function(msg) {
    gutil.log("nw-builder", msg);
  });

  return nw.build().catch(function(err) {
    gutil.log("nw-builder", err);
  });
});

gulp.task("nw win64 SDK", ["CryptoARM (win64)", "trusted-crypto (win64) copy"], function() {
  var nw = new NwBuilder({
    version: NWJS_VERSION,
    flavor: "sdk",
    files: "./tmp_app_build/win64/**/**",
    cacheDir: "./cache",
    platforms: ["win64"]
  });

  nw.on("log", function(msg) {
    gutil.log("nw-builder", msg);
  });

  return nw.build().catch(function(err) {
    gutil.log("nw-builder", err);
  });
});

gulp.task("nwrelease", [
  "nw linux32", "nw linux64"
]);

gulp.task("nwdebug", [
  "nw win64 SDK"
]);

/*
---------------electron build app------------------
*/
gulp.task("electron set platform win32-x64", function() {
  electronPlatform = "win32-x64";
});
gulp.task("electron set platform win32-ia32", function() {
  electronPlatform = "win32-ia32";
});
gulp.task("electron set platform linux-x64", function() {
  electronPlatform = "linux-x64";
});
gulp.task("electron set platform linux-ia32", function() {
  electronPlatform = "linux-ia32";
});
gulp.task("electron set platform darwin-x64", function() {
  electronPlatform = "darwin-x64";
});

gulp.task("Electron resources copy", ["minimize"], function() {
  return gulp.src(["resources/**/**", "node_modules_by_system/win64/**/**"])
    .pipe(gulp.dest("./tmp_app_build/electron-" + electronPlatform));
});

gulp.task("trusted-crypto electron copy", ["Electron resources copy"], function() {
  return gulp.src(["./cache/trusted-crypto/" + electronPlatform + "/**/**"])
    .pipe(gulp.dest("./tmp_app_build/electron-" + electronPlatform + "/node_modules"));
});

gulp.task("build electron", ["trusted-crypto electron copy"], function() {
  return gulp.src("")
    .pipe(electron({
      src: "./tmp_app_build/electron-" + electronPlatform,
      packageJson: packageJson,
      release: "./build/Electron",
      cache: "./cache/electron",
      version: ELECTRON_VERSION,
      packaging: false,
      asar: true,
      platforms: [electronPlatform],
      platformResources: {
        darwin: {
          icon: "./resources/Trusted_eSign/trusted-esign.icns"
        },
        win: {
          icon: "./resources/Trusted_eSign/trusted-esign.ico"
        }
      }
    }))
    .pipe(gulp.dest(""));
});

gulp.task("cert copy", ["build electron"], function() {
  return gulp.src(["./resources/Trusted_eSign/cert1.crt", "./resources/Trusted_eSign/cert1.key"])
    .pipe(gulp.dest("./build/Electron/" + ELECTRON_VERSION + "/" + electronPlatform));
});

gulp.task("remove app folder", ["build electron"], function() {
  return del(["./build/Electron/" + ELECTRON_VERSION + "/" + electronPlatform + "/resources/app"]);
});

gulp.task("electron-win64", ["electron set platform win32-x64",
  "build electron",
  "cert copy",
  "remove app folder"
]);

gulp.task("electron-win32", ["electron set platform win32-ia32",
  "build electron",
  "cert copy",
  "remove app folder"
]);

gulp.task("electron-linux64", ["electron set platform linux-x64",
  "build electron",
  "cert copy",
  "remove app folder"
]);

gulp.task("electron-linux32", ["electron set platform linux-ia32",
  "build electron",
  "cert copy",
  "remove app folder"
]);

gulp.task("electron-darwinx64", ["electron set platform darwin-x64",
  "build electron",
  "cert copy",
  "remove app folder"
]);

gulp.task("default", [
  "electron-win64"
]);
