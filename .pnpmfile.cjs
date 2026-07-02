let githubPackageIndex = 0;
const githubPackageNames = ['dnd5e', 'fvtt-types', 'sequencer'];

function readPackage(pkg, context) {
  if (!pkg.name) {
    const name = githubPackageNames[githubPackageIndex++];
    context.log(`Fixing missing package name: assigning "${name}"`);
    pkg.name = name;
  }
  return pkg;
}

const pnpmFile = {
  hooks: {
    readPackage,
  },
};

module.exports = pnpmFile;
