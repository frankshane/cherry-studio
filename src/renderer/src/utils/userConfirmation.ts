import Logger from '@renderer/config/logger'
import { MCPTool } from '@renderer/types'

// 工具确认的类型
export type ToolConfirmationResult = 'approved' | 'allow_once' | 'denied'

// 服务器确认数据结构
interface ServerConfirmationData {
  tools: MCPTool[]
  toolIds: string[]
  resolver: (value: ToolConfirmationResult) => void
  abortListener?: () => void
}

const serverConfirmResolvers = new Map<string, ServerConfirmationData>()

const serverPromises = new Map<string, Promise<ToolConfirmationResult>>()

const toolToServerMapping = new Map<string, string>()

/**
 * 请求服务器级别的确认（批量确认）
 * @param serverId MCP服务器ID
 * @param tools 该服务器下需要确认的工具列表
 * @param toolIds 工具ID列表
 * @param abortSignal 中断信号
 */
export function requestServerConfirmation(
  serverId: string,
  tools: MCPTool[],
  toolIds: string[],
  abortSignal?: AbortSignal
): Promise<ToolConfirmationResult> {
  // 如果服务器已经有待确认的请求，返回现有的Promise
  const existing = serverConfirmResolvers.get(serverId)
  if (existing) {
    return serverPromises.get(serverId) || Promise.resolve('denied')
  }

  const promise = new Promise<ToolConfirmationResult>((resolve) => {
    if (abortSignal?.aborted) {
      resolve('denied')
      return
    }

    // 建立工具ID到服务器ID的映射
    toolIds.forEach((toolId) => {
      toolToServerMapping.set(toolId, serverId)
    })

    const confirmationData: ServerConfirmationData = {
      tools,
      toolIds,
      resolver: (result) => {
        Logger.log(`🔧 [userConfirmation] Resolver called for server ${serverId} with result: ${result}`)
        resolve(result)
      }
    }

    if (abortSignal) {
      const abortListener = () => {
        const data = serverConfirmResolvers.get(serverId)
        if (data) {
          data.resolver('denied')
          // 清理工具映射
          data.toolIds.forEach((toolId) => {
            toolToServerMapping.delete(toolId)
          })
          serverConfirmResolvers.delete(serverId)
          serverPromises.delete(serverId)
        }
      }

      abortSignal.addEventListener('abort', abortListener)
      confirmationData.abortListener = () => {
        abortSignal.removeEventListener('abort', abortListener)
      }
    }

    serverConfirmResolvers.set(serverId, confirmationData)
  })

  serverPromises.set(serverId, promise)
  return promise
}

/**
 * 确认服务器操作（批量确认该服务器下的所有工具）
 * @param serverId 服务器ID
 * @param result 确认结果
 */
export function confirmServerAction(serverId: string, result: ToolConfirmationResult = 'allow_once') {
  const data = serverConfirmResolvers.get(serverId)
  if (data) {
    data.resolver(result)
    data.toolIds.forEach((toolId) => {
      toolToServerMapping.delete(toolId)
    })

    if (data.abortListener) {
      data.abortListener()
    }

    serverConfirmResolvers.delete(serverId)
    serverPromises.delete(serverId)
  } else {
    Logger.warn(`🔧 [userConfirmation] No resolver found for server: ${serverId}`)
  }
}

/**
 * 取消服务器操作
 * @param serverId 服务器ID
 */
export function cancelServerAction(serverId: string) {
  confirmServerAction(serverId, 'denied')
}

/**
 * 兼容性方法：确认工具操作（内部映射到服务器确认）
 * @deprecated 请使用 confirmServerAction
 */
export function confirmToolAction(toolId: string, result: ToolConfirmationResult = 'allow_once') {
  const serverId = toolToServerMapping.get(toolId)
  if (serverId) {
    confirmServerAction(serverId, result)
  } else {
    Logger.warn(`🔧 [userConfirmation] No server mapping found for tool: ${toolId}`)
  }
}

// ====== 查询方法 ======

/**
 * 获取所有待确认的服务器信息
 */
export function getPendingServerConfirmations(): Array<{
  serverId: string
  tools: MCPTool[]
  toolIds: string[]
}> {
  return Array.from(serverConfirmResolvers.entries()).map(([serverId, data]) => ({
    serverId,
    tools: data.tools,
    toolIds: data.toolIds
  }))
}

/**
 * 检查某个服务器是否在等待确认
 */
export function isServerPending(serverId: string): boolean {
  return serverConfirmResolvers.has(serverId)
}

/**
 * 根据工具ID获取对应的服务器ID
 */
export function getServerIdByToolId(toolId: string): string | undefined {
  return toolToServerMapping.get(toolId)
}
