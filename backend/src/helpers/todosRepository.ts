import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
const AWSXRay = require('aws-xray-sdk');
const XAWS = AWSXRay.captureAWS(AWS)


export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todosIndex = process.env.INDEX_NAME
    ) { }


    async findAllByUserId(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todosIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        })
            .promise()

        const items = result.Items
        return items as TodoItem[]
    }

    async create(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient
            .put({
                TableName: this.todosTable,
                Item: todoItem
            })
            .promise()
        return todoItem as TodoItem
    }

    async update(todoId: string, userId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        const result = await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ":name": todoUpdate.name,
                ":dueDate": todoUpdate.dueDate,
                ":done": todoUpdate.done
            },
            ReturnValues: 'ALL_NEW'
        }).promise()
        const updateItem = result.Attributes
        return updateItem as TodoUpdate
    }

    async deleteById(todoId: string, userId: string): Promise<string> {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            }
        }).promise()
        return todoId as string
    }
}