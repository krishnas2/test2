var path = require('path');
var fs = require('fs');
/* //joining path of directory
var directoryPath = path.join(__dirname, 'jsontest1/DataRaptor/cryptoextract');
//passsing directoryPath and callback function
fs.readdir(directoryPath, function (err, files) {
//handling error
if (err) {
return console.log('Unable to scan directory: ' + err);
}
//listing all files using forEach
files.forEach(function (file) {
// Do whatever you want to do with the file
console.log(file,typeof(file));
});
}); */
var walkSync = function(dir, filelist) {
  var fs = fs || require('fs'),
      files = fs.readdirSync(dir);
  filelist = filelist || [];
  files.forEach(function(file) {
    if (fs.statSync(dir + file).isDirectory()) {
      filelist = walkSync(dir + file + '/', filelist);
    }
    else {
		console.log(path.resolve(dir,file));
      filelist.push(file);
    }
  });
  return filelist;
};
var DataRaptorDataPack=require('./lib/schema');
console.log(DataRaptorDataPack.DataRaptorDatapack);
console.log(walkSync(path.join(__dirname, 'jsontest2/')));