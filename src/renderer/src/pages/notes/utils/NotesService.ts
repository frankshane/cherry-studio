import FileManager from '@renderer/services/FileManager'
import { FileTypes } from '@renderer/types/file'
import { NotesTreeNode } from '@renderer/types/note'
import { v4 as uuidv4 } from 'uuid'

const NOTES_FOLDER_PREFIX = 'notes'

export class NotesService {
  private static readonly NOTES_STORAGE_KEY = 'notes-tree-structure'

  /**
   * 获取笔记树结构
   */
  static async getNotesTree(): Promise<NotesTreeNode[]> {
    try {
      const storedTree = localStorage.getItem(this.NOTES_STORAGE_KEY)
      if (storedTree) {
        return JSON.parse(storedTree)
      }
      return []
    } catch (error) {
      console.error('Failed to get notes tree:', error)
      return []
    }
  }

  /**
   * 保存笔记树结构
   */
  static async saveNotesTree(tree: NotesTreeNode[]): Promise<void> {
    try {
      localStorage.setItem(this.NOTES_STORAGE_KEY, JSON.stringify(tree))
    } catch (error) {
      console.error('Failed to save notes tree:', error)
    }
  }

  /**
   * 创建新文件夹
   */
  static async createFolder(name: string, parentId?: string): Promise<NotesTreeNode> {
    const folderId = uuidv4()
    const folderPath = this.buildPath(name, parentId)

    const folder: NotesTreeNode = {
      id: folderId,
      name,
      type: 'folder',
      path: folderPath,
      children: [],
      expanded: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const tree = await this.getNotesTree()
    this.insertNodeIntoTree(tree, folder, parentId)
    await this.saveNotesTree(tree)

    return folder
  }

  /**
   * 创建新笔记文件
   */
  static async createNote(name: string, content: string = '', parentId?: string): Promise<NotesTreeNode> {
    const noteId = uuidv4()
    const notePath = this.buildPath(name, parentId)

    try {
      // 创建临时文件并写入内容
      const tempPath = await window.api.file.createTempFile(noteId)
      await window.api.file.write(tempPath, content)

      // 通过FileManager上传文件
      const fileMetadata = await FileManager.uploadFile({
        id: noteId,
        name,
        origin_name: name,
        path: tempPath,
        size: content.length,
        ext: '.md',
        type: FileTypes.TEXT,
        created_at: new Date().toISOString(),
        count: 1
      })

      const note: NotesTreeNode = {
        id: noteId,
        name,
        type: 'file',
        path: notePath,
        fileId: fileMetadata.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const tree = await this.getNotesTree()
      this.insertNodeIntoTree(tree, note, parentId)
      await this.saveNotesTree(tree)

      return note
    } catch (error) {
      console.error('Failed to create note:', error)
      throw error
    }
  }

  /**
   * 读取笔记内容
   */
  static async readNote(node: NotesTreeNode): Promise<string> {
    if (node.type !== 'file' || !node.fileId) {
      throw new Error('Invalid note node')
    }

    try {
      // 直接使用文件ID读取
      return await window.api.file.read(node.fileId)
    } catch (error) {
      console.error('Failed to read note:', error)
      throw error
    }
  }

  /**
   * 更新笔记内容
   */
  static async updateNote(node: NotesTreeNode, content: string): Promise<void> {
    if (node.type !== 'file' || !node.fileId) {
      throw new Error('Invalid note node')
    }

    try {
      await window.api.file.writeWithId(node.fileId, content)

      // 更新树结构中的修改时间
      const tree = await this.getNotesTree()
      const targetNode = this.findNodeInTree(tree, node.id)
      if (targetNode) {
        targetNode.updatedAt = new Date().toISOString()
        await this.saveNotesTree(tree)
      }
    } catch (error) {
      console.error('Failed to update note:', error)
      throw error
    }
  }

  /**
   * 删除笔记或文件夹
   */
  static async deleteNode(nodeId: string): Promise<void> {
    const tree = await this.getNotesTree()
    const node = this.findNodeInTree(tree, nodeId)

    if (!node) {
      throw new Error('Node not found')
    }

    try {
      // 递归删除所有子节点的文件
      await this.deleteNodeRecursively(node)

      // 从树结构中移除节点
      this.removeNodeFromTree(tree, nodeId)
      await this.saveNotesTree(tree)
    } catch (error) {
      console.error('Failed to delete node:', error)
      throw error
    }
  }

  /**
   * 重命名节点
   */
  static async renameNode(nodeId: string, newName: string): Promise<void> {
    const tree = await this.getNotesTree()
    const node = this.findNodeInTree(tree, nodeId)

    if (!node) {
      throw new Error('Node not found')
    }

    node.name = newName
    node.updatedAt = new Date().toISOString()

    await this.saveNotesTree(tree)
  }

  /**
   * 切换节点展开状态
   */
  static async toggleNodeExpanded(nodeId: string): Promise<void> {
    const tree = await this.getNotesTree()
    const node = this.findNodeInTree(tree, nodeId)

    if (node && node.type === 'folder') {
      node.expanded = !node.expanded
      await this.saveNotesTree(tree)
    }
  }

  /**
   * 切换收藏状态
   */
  static async toggleStarred(nodeId: string): Promise<void> {
    const tree = await this.getNotesTree()
    const node = this.findNodeInTree(tree, nodeId)

    if (node) {
      node.is_starred = !node.is_starred
      await this.saveNotesTree(tree)
    }
  }

  /**
   * 移动节点到新的父节点
   */
  static async moveNode(nodeId: string, newParentId?: string): Promise<void> {
    const tree = await this.getNotesTree()
    const node = this.findNodeInTree(tree, nodeId)

    if (!node) {
      throw new Error('Node not found')
    }

    // 从当前位置移除
    this.removeNodeFromTree(tree, nodeId)

    // 插入到新位置
    this.insertNodeIntoTree(tree, node, newParentId)

    await this.saveNotesTree(tree)
  }

  /**
   * 构建文件路径
   */
  private static buildPath(name: string, parentId?: string): string {
    const segments = [NOTES_FOLDER_PREFIX]

    if (parentId) {
      // 这里应该根据parentId构建完整路径，简化处理
      segments.push(parentId)
    }

    segments.push(name)
    return segments.join('/')
  }

  /**
   * 在树中插入节点
   */
  private static insertNodeIntoTree(tree: NotesTreeNode[], node: NotesTreeNode, parentId?: string): void {
    if (!parentId) {
      tree.push(node)
      return
    }

    const parent = this.findNodeInTree(tree, parentId)
    if (parent && parent.type === 'folder') {
      if (!parent.children) {
        parent.children = []
      }
      parent.children.push(node)
    }
  }

  /**
   * 在树中查找节点
   */
  private static findNodeInTree(tree: NotesTreeNode[], nodeId: string): NotesTreeNode | null {
    for (const node of tree) {
      if (node.id === nodeId) {
        return node
      }
      if (node.children) {
        const found = this.findNodeInTree(node.children, nodeId)
        if (found) {
          return found
        }
      }
    }
    return null
  }

  /**
   * 从树中移除节点
   */
  private static removeNodeFromTree(tree: NotesTreeNode[], nodeId: string): boolean {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].id === nodeId) {
        tree.splice(i, 1)
        return true
      }
      if (tree[i].children) {
        const removed = this.removeNodeFromTree(tree[i].children!, nodeId)
        if (removed) {
          return true
        }
      }
    }
    return false
  }

  /**
   * 递归删除节点及其文件
   */
  private static async deleteNodeRecursively(node: NotesTreeNode): Promise<void> {
    if (node.type === 'file' && node.fileId) {
      // 删除文件
      await FileManager.deleteFile(node.fileId)
    } else if (node.type === 'folder' && node.children) {
      // 递归删除子节点
      for (const child of node.children) {
        await this.deleteNodeRecursively(child)
      }
    }
  }
}
