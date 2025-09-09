// src/uploader/uploader.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ImageDto } from './dto/image.dto';
import {
  deleteImageFolder,
  handleImagePersistence,
} from './utils/image-handler';

@Injectable()
export class UploaderService {
  uploadImage(images: Express.Multer.File[]){
    if (!images || images.length === 0) {
      throw new NotFoundException('해당 이미지를 찾을 수 없습니다.');
    }
    const fileUrls = images.map(image => `https://gyubuntu.duckdns.org/uploads/temp/${image.filename}`);
    return fileUrls;
  }

  async createImg(serviceName: string, dto: ImageDto) {
    const { id, images, entity } = dto;
    return await handleImagePersistence(id, serviceName, images ? images : [], [], entity);
  }

  async updateImg(serviceName: string, dto: ImageDto) {
    const { id, images, entity, existingImages } = dto;
    return await handleImagePersistence(
      id,
      serviceName,
      images ? images : [],
      existingImages ? existingImages : [],
      entity,
    );
  }

  async deleteImg(serviceName: string,dto: ImageDto) {
    const { id, entity } = dto;
    await deleteImageFolder(id,serviceName, entity);
    return true;
  }
}
