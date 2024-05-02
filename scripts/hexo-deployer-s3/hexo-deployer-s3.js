const fs = require('fs')
const path = require('path')
const mime = require('mime')
const { S3Client, PutObjectCommand, ListObjectsCommand } = require('@aws-sdk/client-s3')

async function hexoDeployerS3(args) {
  const s3Client = new S3Client({
    region: args.region,
    endpoint: args.endpoint,
    forcePathStyle: false,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
    httpOptions: { connectTimeout: 10000, timeout: 10000 },
  })

  const publicDir = this.config.public_dir
  const logger = this.log

  const existObject = {}
  if (args.skip_exist) {
    const result = await s3Client.send(
      new ListObjectsCommand({ Bucket: args.bucket, Prefix: args.prefix })
    )
    const existList = result.Contents
    existList.forEach(item => {
      existObject[item.Key] = true
    })
  }

  async function uploadDirectory(dir) {
    const files = fs.readdirSync(dir)

    for (const file of files) {
      const localPath = path.join(dir, file)
      if (fs.lstatSync(localPath).isDirectory()) {
        uploadDirectory(localPath)
        continue
      } else if (args.skip_html && localPath.endsWith('.html')) {
        continue
      } else if (args.skip_fonts && /\.(eot|ttf|otf|woff|woff2)$/.test(localPath)) {
        continue
      }

      const s3Path = path.join(args.prefix, dir.replace(publicDir, ''), file).replace(/\\/g, '/')

      if (args.skip_exist && existObject[s3Path]) {
        continue
      }

      const uploadParams = {
        Bucket: args.bucket,
        Body: fs.readFileSync(localPath),
        Key: s3Path,
        ContentType: mime.getType(localPath),
      }

      const uploadCommand = new PutObjectCommand(uploadParams)
      logger.info('uploading:', localPath)
      await s3Client.send(uploadCommand)
      logger.info('upload ok:', localPath)
    }
  }

  await uploadDirectory(publicDir)
}

module.exports = hexoDeployerS3
