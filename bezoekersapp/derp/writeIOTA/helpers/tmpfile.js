
var fs = require('fs');

const logInTmpFile = (file, src) => {
  fs.open(file,'w',(err, fd) => {
    if(err) throw err;
    fs.write(fd, src, 0, 'utf8', (err2, w, s) => {
      if(err2) throw err2;
    });
  });
}

const getFromTmpFile = (file) => {
  try {
    return fs.readFileSync(file,{encoding:'utf8'});
  }
  catch(e) {
    console.log('error reading '+file);
  }
}

module.exports = {
  logInTmpFile,
  getFromTmpFile
};