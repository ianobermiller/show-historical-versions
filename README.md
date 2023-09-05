# Show Historical Versions of Files in a Backblaze B2 Bucket

This Node.js app, written in TypeScript, lists all non-current file versions in the given bucket.

## Prerequisites
* [Node.js](https://nodejs.org/)

## Install Dependencies

```console
$ npm install

added 11 packages, and audited 12 packages in 808ms

3 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

## Build the App

Since the app is written in TypeScript, you must compile the source to JavaScript before you run the app:

```console
$ npm run build

> show_history@1.0.0 build
> tsc -p .
```

## Configure the App

The app expects to find B2 credentials in environment variables or in a `.env` file thus:

```bash
B2_APPLICATION_KEY_ID='your-b2-application-key-id'
B2_APPLICATION_KEY='your-b2-application-key'
```

You can copy the provided `.env-template` file to `.env`, then edit the latter file, for example:

```console
$ cp .env-template .env
$ vi .env
```

## Run the App

The app accepts a Backblaze B2 Bucket name as its only argument:

```console
$ npm start some-bucket-name
```

## Output

Output is formatted identically to `b2 ls`, that is:

```text
file_id  action  date  time  size  name
```

Fields are separated by two spaces, with `action` left-padded with spaces to six characters and `size` left-padded with spaces to nine characters.

The `action` value is one of the following:

* `upload`: a file that was uploaded
* `start`: a large file that has been started, but not finished or canceled
* `hide`: a file version ("hide marker") marking the file as hidden

Dates and times are in UTC and formatted `yyyy-MM-dd` and `HH:mm:ss` respectively.

For example:

```console
% npm start -s metadaddy-private
4_z0145cfc9e3f5ec0f74ed0c1b_f117d3fad62e89e20_d20230402_m183653_c004_v0402012_t0031_u01680460613262  upload  2023-04-02  18:36:53      14003  Cloud.png
4_z0145cfc9e3f5ec0f74ed0c1b_f10555548c74945d6_d20230402_m182920_c004_v0402006_t0049_u01680460160390  upload  2023-04-02  18:29:20      14003  Cloud.png
4_z0145cfc9e3f5ec0f74ed0c1b_f1162a5321e4a154a_d20230402_m182625_c004_v0402014_t0017_u01680459985381  upload  2023-04-02  18:26:25      14003  Cloud.png
```