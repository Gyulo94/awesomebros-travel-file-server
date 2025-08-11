import { InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

const UPLOAD_DESTINATION = '/home/gyubuntu/project/media/trip_gg_uploads';
const TEMP_UPLOAD_DESTINATION = path.join(UPLOAD_DESTINATION, 'temp');
const BASE_URL_FOR_FILES = 'https://gyubuntu.duckdns.org/trip_gg/media/';

export async function handleImagePersistence(
  entityId: string,
  desiredImageFilenames: string[] = [],
  oldImageUrlsFromDb: string[] = [],
  entityType: string,
): Promise<string[]> {
  const baseUploadDir = path.join(
    UPLOAD_DESTINATION,
    'images',
    entityType,
  );
  const entitySpecificDir = path.join(baseUploadDir, entityId);

  const finalImageUrls: string[] = [];
  const desiredBasenamesSet = new Set<string>();

  await fs.mkdir(entitySpecificDir, { recursive: true });

  for (const filenameFromFrontend of desiredImageFilenames) {
    const actualFilename = path.basename(filenameFromFrontend);
    desiredBasenamesSet.add(actualFilename);

    const existingImageUrl = oldImageUrlsFromDb.find(
      (oldUrl) => path.basename(oldUrl) === actualFilename,
    );

    if (existingImageUrl) {
      finalImageUrls.push(existingImageUrl);
    } else {
      const imageTempPath = path.join(
       TEMP_UPLOAD_DESTINATION,
        actualFilename,
      );
      const finalDestinationPath = path.join(entitySpecificDir, actualFilename);

      try {
        await fs.rename(imageTempPath, finalDestinationPath);
        console.log(
          `새 이미지 이동 성공: ${imageTempPath} -> ${finalDestinationPath}`,
        );
        finalImageUrls.push(
          `${BASE_URL_FOR_FILES}images/${entityType}/${entityId}/${actualFilename}`,
        );
      } catch (error) {
        console.error(`새 이미지 이동 실패: ${imageTempPath}`, error);
        try {
          await fs.unlink(imageTempPath);
        } catch (unlinkError) {
          console.error(
            `실패한 임시 파일 삭제 실패: ${imageTempPath}`,
            unlinkError,
          );
        }
        throw new InternalServerErrorException('이미지 파일 이동 중 오류 발생');
      }
    }
  }

  for (const oldUrl of oldImageUrlsFromDb) {
    const oldFilename = path.basename(oldUrl);
    if (!desiredBasenamesSet.has(oldFilename)) {
      const oldImagePath = path.join(entitySpecificDir, oldFilename);
      try {
        await fs.unlink(oldImagePath);
        // console.log(`기존 이미지 삭제 성공: ${oldImagePath}`);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.error(
            `기존 이미지 삭제 실패 (ENOENT 아님): ${oldImagePath}`,
            error,
          );
        } else {
          // console.log(`기존 이미지 없음 (삭제 스킵): ${oldImagePath}`);
        }
      }
    }
  }

  return finalImageUrls;
}

export async function deleteImageFolder(
  entityId: string,
  entityType: string,
): Promise<void> {
  const baseUploadDir = path.join(
    UPLOAD_DESTINATION,
    'images',
    entityType,
  );
  const entitySpecificDir = path.join(baseUploadDir, entityId);

  try {
    await fs.rm(entitySpecificDir, { recursive: true, force: true });
    console.log(`이미지 폴더 삭제 성공: ${entitySpecificDir}`);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log(`이미지 폴더 없음 (삭제 스킵): ${entitySpecificDir}`);
    } else {
      console.error(`이미지 폴더 삭제 실패: ${entitySpecificDir}`, error);
      throw new InternalServerErrorException('이미지 파일 이동 중 오류 발생');
    }
  }
}
