const path = require("path");
const chalk = require("chalk");
const fg = require("fast-glob");
const prompts = require('prompts');

const utils = require('./utils');

function detectDeadCode(compilation, options) {
  const assets = getWebpackAssets(compilation);
  const compiledFiles = convertFilesToDict(assets);
  const includedFiles = fg.sync(getPattern(options));

  let unusedFiles = [];
  let unusedExportMap = [];

  if (options.detectUnusedFiles) {
    unusedFiles = includedFiles.filter(file => !compiledFiles[file]);
    setTimeout(() => {
      logUnusedFiles(unusedFiles);
      handleUnusedFiles(unusedFiles, options.outputFile);
    }, 100);
  }

  if (options.detectUnusedExport) {
    unusedExportMap = getUsedExportMap(convertFilesToDict(includedFiles), compilation);
    logUnusedExportMap(unusedExportMap);
  }

  if (unusedFiles.length > 0 || unusedExportMap.length > 0) {
    if (options.failOnHint) {
      process.exit(2);
    }
  }
}

function getPattern({ context, patterns, exclude }) {
  return patterns.map(pattern => path.resolve(context, pattern)).concat(exclude.map(pattern => `!${pattern}`));
}

function getUsedExportMap(includedFileMap, compilation) {
  const unusedExportMap = {};

  compilation.chunks.forEach(function(chunk) {
    for (const module of chunk.modulesIterable) {
      if (!module.resource) continue;

      const providedExports = module.providedExports || module.buildMeta.providedExports;
      const path = convertToUnixPath(module.resource);

      if (
        module.usedExports !== true &&
        providedExports !== true &&
        /^((?!(node_modules)).)*$/.test(path) &&
        includedFileMap[path]
      ) {
        if (module.usedExports === false) {
          unusedExportMap[path] = providedExports;
        } else if (providedExports instanceof Array) {
          const unusedExports = providedExports.filter(
            x => module.usedExports instanceof Array && !module.usedExports.includes(x)
          );

          if (unusedExports.length > 0) {
            unusedExportMap[path] = unusedExports;
          }
        }
      }
    }
  });
  return unusedExportMap;
}

function logUnusedExportMap(unusedExportMap) {
  console.log(chalk.yellow("\n--------------------- Unused Exports ---------------------"));
  if (Object.keys(unusedExportMap).length > 0) {
    let numberOfUnusedExport = 0;

    Object.keys(unusedExportMap).forEach(modulePath => {
      const unusedExports = unusedExportMap[modulePath];

      console.log(chalk.yellow(`\n${modulePath}`));
      console.log(chalk.yellow(`    ⟶   ${unusedExports.join(", ")}`));
      numberOfUnusedExport += unusedExports.length;
    });
    console.log(chalk.yellow(`\nThere are ${numberOfUnusedExport} unused exports (¬º-°)¬.\n`));
  } else {
    console.log(chalk.green("\nPerfect, there is nothing to do ٩(◕‿◕｡)۶."));
  }
}

function getWebpackAssets(compilation) {
  let assets = Array.from(compilation.fileDependencies);

  Object.keys(compilation.assets).forEach(assetName => {
    const assetPath = compilation.assets[assetName].existsAt;

    assets.push(assetPath);
  });
  return assets;
}

function convertFilesToDict(assets) {
  return assets
    .filter(file => file.indexOf("node_modules") === -1)
    .reduce((acc, file) => {
      const unixFile = convertToUnixPath(file);

      acc[unixFile] = true;
      return acc;
    }, {});
}

function handleUnusedFiles(unusedFiles, outputFilePath) {

  const questions = [{
    type: 'toggle',
    name: 'delete',
    initial: true,
    active: 'yes',
    inactive: 'no',
    message: 'delete all unused files ?'
  }, {
    type: 'toggle',
    name: 'output',
    initial: true,
    active: 'yes',
    inactive: 'no',
    message: 'output path of unused files ?'
  }];

  (async () => {
    const response = await prompts(questions);

    if (response.delete === true) {
      utils.deleteFiles(unusedFiles.slice(0, 2));
      console.log(chalk.green(`delete ${unusedFiles.length} unused files successfully `));
    }

    if (response.output === true) {
      utils.writeFile(outputFilePath, JSON.stringify(unusedFiles));
      console.log(chalk.green(`output file: ${outputFilePath}`))
    }

    console.log('The End');

    process.exit();
  
  })();
}

function logUnusedFiles(unusedFiles) {
  console.log(chalk.yellow("\n--------------------- Unused Files ---------------------"));
  if (unusedFiles.length > 0) {
    unusedFiles.forEach(file => console.log(`\n${chalk.yellow(file)}`));
    console.log(
      chalk.yellow(`\nThere are ${unusedFiles.length} unused files (¬º-°)¬.`),
      chalk.red.bold(`\n\nPlease be careful if you want to remove them.\n`)
    );

  } else {
    console.log(chalk.green("\nPerfect, there is nothing to do ٩(◕‿◕｡)۶."));
  }
}

function convertToUnixPath(path) {
  return path.replace(/\\+/g, "/");
}
module.exports = detectDeadCode;
