import { DeleteOutlined } from '@ant-design/icons'
import { FileMetadata } from '@renderer/types'
import { Popconfirm, Upload } from 'antd'
import { Button } from 'antd'
import type { RcFile, UploadProps } from 'antd/es/upload'
import React from 'react'
import styled from 'styled-components'

interface ImageUploaderProps {
  fileMap: {
    imageFiles?: FileMetadata[]
    paths?: string[]
  }
  maxImages: number
  onClearImages: () => void
  onDeleteImage: (index: number) => void
  onAddImage: (file: File, index?: number) => void
  mode: string
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  fileMap,
  maxImages,
  onClearImages,
  onDeleteImage,
  onAddImage
}) => {
  const handleBeforeUpload = (file: RcFile, index?: number) => {
    onAddImage(file, index)
    return false
  }

  const customRequest: UploadProps['customRequest'] = ({ onSuccess }) => {
    if (onSuccess) {
      onSuccess('ok' as any)
    }
  }

  const hasImages = fileMap.paths && fileMap.paths.length > 0

  return (
    <Container>
      {hasImages && (
        <HeaderContainer>
          <Button size="small" onClick={onClearImages}>
            清除全部
          </Button>
        </HeaderContainer>
      )}

      <UploadContainer>
        {hasImages && (
          <ImageGrid>
            {fileMap.paths!.map((src, index) => (
              <ImageItem key={index}>
                <ImageUploadButton
                  accept="image/*"
                  maxCount={1}
                  multiple={false}
                  showUploadList={false}
                  customRequest={customRequest}
                  beforeUpload={(file) => handleBeforeUpload(file, index)}>
                  <ImagePreview>
                    <img src={src} alt={`预览图${index + 1}`} />
                  </ImagePreview>
                </ImageUploadButton>
                <Popconfirm
                  title="确定要删除这张图片吗？"
                  okText="确定"
                  cancelText="取消"
                  onConfirm={() => onDeleteImage(index)}>
                  <DeleteButton>
                    <DeleteOutlined />
                  </DeleteButton>
                </Popconfirm>
              </ImageItem>
            ))}
          </ImageGrid>
        )}

        {(!fileMap.imageFiles || fileMap.imageFiles.length < maxImages) && (
          <EmptyUploadArea>
            <Upload
              accept="image/*"
              multiple={false}
              showUploadList={false}
              customRequest={customRequest}
              beforeUpload={(file) => handleBeforeUpload(file)}>
              <UploadContent />
            </Upload>
          </EmptyUploadArea>
        )}
      </UploadContainer>
    </Container>
  )
}

const Container = styled.div`
  width: 100%;
`

const HeaderContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
`

const UploadContainer = styled.div`
  width: 100%;
`

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`

const ImageItem = styled.div`
  position: relative;
  aspect-ratio: 1;
`

const ImageUploadButton = styled(Upload)`
  width: 100%;
  height: 100%;

  .ant-upload {
    width: 100% !important;
    height: 100% !important;
    border-radius: 8px;
    overflow: hidden;
  }
`

const ImagePreview = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &:hover::after {
    content: '点击替换';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 8px;
  }
`

const DeleteButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s ease;
  z-index: 10;

  &:hover {
    opacity: 1;
    background-color: rgba(0, 0, 0, 0.8);
  }
`

const EmptyUploadArea = styled.div`
  width: 100%;
  height: 200px;

  .ant-upload {
    width: 100% !important;
    height: 100% !important;
    border: 2px dashed #d9d9d9;
    border-radius: 8px;
    background: transparent;
    transition: border-color 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .ant-upload:hover {
    border-color: #1890ff;
  }
`

const UploadContent = styled.div`
  width: 100%;
  height: 100%;
  cursor: pointer;
`

export default ImageUploader
