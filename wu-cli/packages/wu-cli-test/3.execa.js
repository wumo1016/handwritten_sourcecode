const execa = require('execa');

(async () => {
  const {
    stdout
  } = await execa('echo', ['hello']);
  console.log(stdout);
})();