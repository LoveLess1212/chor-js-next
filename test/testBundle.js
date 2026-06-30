require('./globals');

var allTests = require.context('./spec', true, /Spec\.js$/);

allTests.keys().forEach(allTests);