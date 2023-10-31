import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

const s3BucketName = process.env.ATTACHMENT_S3_BUCKET
const expireTimes = Number(process.env.SINGED_URL_EXPIRATION)

export class AttachmentUtils {
    constructor(
        private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
        private readonly bucketName = s3BucketName,
    ) { }

    getAttachmentUrl(todoId: string) {
        return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
    }

    getUploadUrl(todoId: string): string {
        const url = this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Key: todoId,
            Expires: expireTimes
        })

        return url as string
    }

    deleteTodoAttachment(attachmentUrl: string){
        const arr = attachmentUrl.split("/")
        const attachmentKey = arr[arr.length - 1]
        return this.s3.deleteObject({
            Bucket: this.bucketName,
            Key: attachmentKey,
        })
    }
}