import { TodosAccess } from './todosRepository'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import * as uuid from 'uuid'

const attachmentUtils = new AttachmentUtils()
const todosAcess = new TodosAccess()


export async function findAllTodos(userId: string): Promise<TodoItem[]> {
    return todosAcess.findAllByUserId(userId)
}


export async function createTodo(newTodo: CreateTodoRequest, userId: string): Promise<TodoItem> {
    const todoId = uuid.v4()
    const createdAt = new Date().toISOString()
    const s3AttachmentUrl = attachmentUtils.getAttachmentUrl(todoId)
    const newItem = {
        userId,
        todoId,
        createdAt,
        done: false,
        attachmentUrl: s3AttachmentUrl,
        ...newTodo
    }
    return await todosAcess.create(newItem)
}

export async function updateTodo(
    todoId: string,
    todoUpdate: UpdateTodoRequest,
    userId: string): Promise<TodoUpdate> {
    return todosAcess.update(todoId, userId, todoUpdate)
}

export async function deleteTodo(
    todoId: string,
    userId: string): Promise<string> {
    return todosAcess.deleteById(todoId, userId)
}

export async function createAttachmentPresignedUrl(todoId: string): Promise<string> {
    return attachmentUtils.getUploadUrl(todoId)
}