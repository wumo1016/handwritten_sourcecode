const execa = require('execa');

(async () => {
    const {stdout} = await execa('echo', ['hello']);//child_process.exec
    console.log(stdout);
})();