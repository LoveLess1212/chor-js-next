import path from 'node:path';
import fs from 'node:fs';

import cp from 'cpy';
import { deleteAsync as del } from 'del';

import { execa as exec } from 'execa';

import { createRequire } from 'node:module';

var dest = process.env.DISTRO_DIST || 'dist';

function resolve(module, sub) {
  var require = createRequire(import.meta.url);
  var pkg = require.resolve(module + '/package.json');

  return path.dirname(pkg) + sub;
}

function buildChorCss() {
  const source = fs.readFileSync('assets/styles/chor-js.css', 'utf8');

  return source
    .replace("@import url('bpmn-js/dist/assets/diagram-js.css');", "@import url('./diagram-js.css');")
    .replace("@import url('bpmn-js/dist/assets/bpmn-font/css/bpmn.css');", "@import url('./bpmn-font/css/bpmn.css');")
    .replace("@import url('../icons/include/css/choreography.css');", "@import url('./choreography/css/choreography.css');");
}

async function run() {

  console.log('clean ' + dest);
  await del(dest);

  console.log('mkdir -p ' + dest);
  fs.mkdirSync(dest, { recursive: true });

  console.log('copy bpmn-font to ' + dest + '/bpmn-font');
  await cp(resolve('bpmn-font', '/dist/css/**'), dest + '/assets/bpmn-font/css');
  await cp(resolve('bpmn-font', '/dist/font/**'), dest + '/assets/bpmn-font/font');

  console.log('copy diagram-js.css to ' + dest);
  await cp(resolve('diagram-js', '/assets/**'), dest + '/assets');

  console.log('copy chor-js icon assets to ' + dest);
  await cp('./assets/icons/include/css/**', dest + '/assets/choreography/css');
  await cp('./assets/icons/include/font/**', dest + '/assets/choreography/font');

  console.log('write chor-js.css to ' + dest);
  fs.writeFileSync(path.join(dest, 'assets', 'chor-js.css'), buildChorCss());

  console.log('building pre-packaged distributions');

  await exec('rollup', [ '-c', '--bundleConfigAsCjs' ], {
    stdio: 'inherit'
  });

  console.log('done.');
}

run().catch(e => {
  console.error('failed to build distribution', e);

  process.exit(1);
});
