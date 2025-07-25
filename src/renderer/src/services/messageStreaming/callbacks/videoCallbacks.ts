import { loggerService } from '@logger'
import { MessageBlockStatus, MessageBlockType, VideoMessageBlock } from '@renderer/types/newMessage'
import { createVideoBlock } from '@renderer/utils/messageUtils/create'

import { BlockManager } from '../BlockManager'

const logger = loggerService.withContext('VideoCallbacks')

interface VideoCallbacksDependencies {
  blockManager: BlockManager
  assistantMsgId: string
}

export const createVideoCallbacks = (deps: VideoCallbacksDependencies) => {
  const { blockManager, assistantMsgId } = deps

  // 内部维护的状态
  let videoBlockId: string | null = null

  return {
    onVideoCreated: async () => {
      if (blockManager.hasInitialPlaceholder) {
        const initialChanges = {
          type: MessageBlockType.VIDEO,
          status: MessageBlockStatus.PENDING
        }
        videoBlockId = blockManager.initialPlaceholderBlockId!
        blockManager.smartBlockUpdate(videoBlockId, initialChanges, MessageBlockType.VIDEO)
      } else if (!videoBlockId) {
        const videoBlock = createVideoBlock(assistantMsgId, {
          status: MessageBlockStatus.PENDING
        })
        videoBlockId = videoBlock.id
        await blockManager.handleBlockTransition(videoBlock, MessageBlockType.VIDEO)
      }
    },

    onVideoDelta: (videoData: any) => {
      const videoUrl = videoData.videos?.[0] || videoData.url || 'placeholder_video_url'
      if (videoBlockId) {
        const changes: Partial<VideoMessageBlock> = {
          url: videoUrl,
          metadata: { generateVideoResponse: videoData },
          status: MessageBlockStatus.STREAMING
        }
        blockManager.smartBlockUpdate(videoBlockId, changes, MessageBlockType.VIDEO, true)
      }
    },

    onVideoGenerated: (videoData: any, metadata: Record<string, any>) => {
      logger.info(`onVideoGenerated: ${JSON.stringify(videoData)}, ${JSON.stringify(metadata)}`)
      if (videoBlockId) {
        if (!videoData) {
          const changes: Partial<VideoMessageBlock> = {
            status: MessageBlockStatus.SUCCESS
          }
          blockManager.smartBlockUpdate(videoBlockId, changes, MessageBlockType.VIDEO)
        } else {
          const changes: Partial<VideoMessageBlock> = {
            url: videoData.url,
            metadata: metadata,
            status: MessageBlockStatus.SUCCESS
          }
          blockManager.smartBlockUpdate(videoBlockId, changes, MessageBlockType.VIDEO, true)
        }
        videoBlockId = null
      } else {
        logger.error('[onVideoGenerated] Last block was not a Video block or ID is missing.')
      }
    },

    onVideoProgress: (progressData: any) => {
      if (videoBlockId) {
        const changes: Partial<VideoMessageBlock> = {
          metadata: {
            ...progressData.metadata,
            progress: progressData.progress,
            stage: progressData.stage || 'processing'
          },
          status: MessageBlockStatus.STREAMING
        }
        blockManager.smartBlockUpdate(videoBlockId, changes, MessageBlockType.VIDEO, true)
      }
    }
  }
}
