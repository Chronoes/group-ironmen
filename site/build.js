const fs = require('fs');
const path = require('path');
const { minify } = require("terser");
const { performance } = require('perf_hooks');
const CleanCSS = require('clean-css');

const cleanCSSInstance = new CleanCSS({});
const productionMode = process.argv.some((arg) => arg === '--prod');
if (productionMode) {
  console.log("Production mode is enabled");
}

const componentBuildPlugin = {
  name: 'componentBuild',
  setup(build) {
    const components = new Set(JSON.parse(fs.readFileSync('components.json', 'utf8')));

    build.onLoad({ filter: /\.js$/ }, async (args) => {
      const componentDir = path.dirname(args.path);
      const componentName = path.basename(args.path, '.js');

      const isComponent = components.has(componentName);
      let jsText = await fs.promises.readFile(args.path, 'utf8');
      if (isComponent) {
        let htmlText = await fs.promises.readFile(`${componentDir}/${componentName}.html`, 'utf8');
        jsText = jsText.replace(`{{${componentName}.html}}`, htmlText);
      }

      return {
        contents: jsText,
        loader: 'js'
      };
    });
  }
}

const buildLoggingPlugin = {
  name: "buildLogging",
  setup(build) {
    let start;
    build.onStart(() => {
      start = performance.now();
      console.log('\nBuild started');
    });

    build.onEnd(() => {
      console.log(`Build finished in ${(performance.now() - start).toFixed(1)}ms`);
    });
  }
};

const htmlBuildPlugin = {
  name: "htmlBuild",
  setup(build) {
    const components = JSON.parse(fs.readFileSync('components.json', 'utf8'));

    build.onEnd(async () => {
      let htmlFile = await fs.promises.readFile("src/index.html", "utf8");

      const cssFiles = ['src/main.css', ...components.map((component) => `./src/${component}/${component}.css`)];
      const cssReadResults = await Promise.all(cssFiles.map((cssFile) => fs.promises.readFile(cssFile, "utf8")));
      let css = cssReadResults.join('');
      if (productionMode) {
        css = cleanCSSInstance.minify(css).styles;
      }
      htmlFile = htmlFile.replace("{{style}}", css);

      await fs.promises.writeFile("public/index.html", htmlFile);
    });
  }
};

const minifyJsPlugin = {
  name: "minifyJs",
  setup(build) {
    build.onEnd(async () => {
      if (!productionMode) return;

      console.log('Minifying app.js');
      const code = await fs.promises.readFile("public/app.js", "utf8");
      const result = await minify(code, {
        sourceMap: {
          filename: "app.js",
          url: "app.js.map"
        },
        ecma: "2017",
        mangle: {
          keep_classnames: false,
          keep_fnames: false,
          module: true,
          reserved: [],
          toplevel: true,
        },
        compress: {
          ecma: "2017"
        }
      });

      await fs.promises.writeFile("public/app.js", result.code);
      await fs.promises.writeFile("public/app.js.map", result.map);
    });
  }
};

function build() {
  require('esbuild').build({
    entryPoints: ['src/index.js'],
    bundle: true,
    sourcemap: true,
    minify: false,
    format: 'esm',
    outfile: 'public/app.js',
    plugins: [componentBuildPlugin, htmlBuildPlugin, minifyJsPlugin, buildLoggingPlugin]
  }).catch((error) => console.error(error));
}

const watch = process.argv.find((arg) => arg === "--watch");
if (watch) {
  const chokidar = require('chokidar');
  const watcher = chokidar.watch('src', {
    ignorePermissionErrors: true,
    ignored: ".#*"
  });
  watcher.on('change', (event, path) => {
    build();
  });
}

build();
