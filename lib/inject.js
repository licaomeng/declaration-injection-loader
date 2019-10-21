const babel = require('babel-core');
const fs = require('fs');
const path = require('path');

const declarationInjector = declarations => ({ template }) => {
  const declarationSnippet = template(declarations, { sourceType: 'module' });

  return {
    visitor: {
      Program(astPath) {
        const lastImport = astPath.get('body').filter(p => p.isImportDeclaration()).pop();

        if (lastImport) {
          lastImport.insertAfter(declarationSnippet());
        }
      }
    }
  };
};

function inject(source, options) {
  const { file, declarations, flags, strict } = options
  // TODO
  // const file = (
  //   flags
  //     ? options.file
  //     : new RegExp(options.file, flags)
  // )

  if (strict && (file === null || declarations === null)) {
    throw new Error('Inject failed (strict mode) : options.file and options.declarations are required')
  }

  const declarationsArr = Array.isArray(declarations) ? declarations : [declarations];

  let fileContent = '';

  if (file) {
    fileContent = fs.readFileSync(path.resolve(String(file)), 'utf8');
  } else {
    fileContent = source
  }

  const plugin = declarationInjector(declarationsArr.join('\n'));
  const result = babel.transform(fileContent, {
    plugins: [plugin]
  });
  const newSource = result.code

  if (strict && (newSource === source)) {
    throw new Error('Inject failed (strict mode) : ' + options.declarations + ' → ' + options.file)
  }

  return newSource
}

module.exports = inject
