// Never put credentials in your code!
import 'dotenv/config'

import B2 from 'backblaze-b2';


// This asynchronous generator function gets 1000 file versions at a time, 
// yields them one at a time.
async function* listFileVersions(bucketName: string) {
    const bucketResponse = await b2.getBucket({ bucketName: bucketName });
    const bucket = bucketResponse.data.buckets[0];
    let fileVersions = {
      files: null,
      nextFileName: null,
      nextFileId: null
    };
    do {
      const fileVersionsResponse = await b2.listFileVersions({
          bucketId: bucket.bucketId,
          maxFileCount: 1000,
          startFileName: fileVersions.nextFileName,
          startFileId: fileVersions.nextFileId
      });
      fileVersions = fileVersionsResponse.data;
      for (const fileVersion of fileVersions.files) {
        yield fileVersion;
      }
    } while (fileVersions.nextFileId);
}


// Return a "0"-padded string representation of the given number
function pad(n: number, length: number = 2) {
  return n.toString().padStart(length, "0");
}


// `b2 ls` Python template format is '%83s  %6s  %10s  %8s  %9d  %s'
// order is file_id, action, date, time, size, name
function printVersionDetail(fileVersion: any) {
  const d = new Date(fileVersion.uploadTimestamp);
  const dateString = `${pad(d.getUTCFullYear(), 4)}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
  const timeString = `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;

  console.log(`${fileVersion.fileId}  ${fileVersion.action.padStart(6)}` +
    `  ${dateString}  ${timeString}` + 
    `  ${fileVersion.contentLength.toString().padStart(9)}  ${fileVersion.fileName}`);
}


// For each non-current version, show same output as `b2 ls`, that is:
// file id, whether it is an uploaded file or the hiding of a file, upload 
// date/time, file size, and the file name
async function showHistory(bucketName: string) {
  try {
    await b2.authorize(); // must authorize first (authorization lasts 24 hrs)
    let currentFileName, currentHidden;
    for await (const fileVersion of listFileVersions(bucketName)) {
      if (fileVersion.fileName !== currentFileName) {
        // First version with a given name is the current version - don't
        // show it
        currentFileName = fileVersion.fileName;
      } else {
        printVersionDetail(fileVersion);
      }
    }
  } catch (err) {
    console.log('Error getting bucket:', err);
  }
}


// Get bucket name from command line
if (process.argv.length < 3) {
  console.error(`Usage: ${process.argv[0]} ${process.argv[1]} bucket-name`);
  process.exit(1);
}
const bucketName = process.argv[2];

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY
});

showHistory(bucketName);