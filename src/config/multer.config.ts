import { Injectable } from '@nestjs/common';
import { MulterOptionsFactory } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as multer from 'multer';
import * as path from 'path';
import * as uuid from 'uuid';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
   private readonly UPLOAD_DESTINATION: string;
  private readonly BASE_URL_FOR_FILES: string;
  constructor() {
    this.UPLOAD_DESTINATION =
      process.env.UPLOAD_DESTINATION ||
      '/home/gyubuntu/project/media/trip_gg_uploads';

    this.BASE_URL_FOR_FILES =
      process.env.BASE_URL_FOR_FILES ||
      'https://gyubuntu.duckdns.org/trip_gg/media/';
    this.mkdir();
  }

  mkdir() {
     try {
      if (!fs.existsSync(this.UPLOAD_DESTINATION)) {
        fs.mkdirSync(this.UPLOAD_DESTINATION, { recursive: true });
        console.log(`Upload directory created: ${this.UPLOAD_DESTINATION}`);
      } else {
        console.log(`Upload directory already exists: ${this.UPLOAD_DESTINATION}`);
      }
    } catch (err) {
      console.error(
        `Failed to create upload directory ${this.UPLOAD_DESTINATION}:`,
        err,
      );
      throw new Error(`파일 업로드 디렉토리 생성 실패: ${err.message}`);
    }
  }

  createMulterOptions(): multer.Options {
    const option: multer.Options = {
      storage: multer.diskStorage({
        destination: (req, file, done) => {
          done(null, this.UPLOAD_DESTINATION);
        },

        filename: (req, file, done) => {
          const ext = path.extname(file.originalname);
          const name = uuid.v4();

          done(null, `${name}${ext}`);
        },
      }),
      limits: {
        fileSize: 100 * 1024 * 1024,
      },
      fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith('image/')) {
          callback(null, true);
        } else {
           callback(null, false);
        }
      },
    };
    return option;
  }

  getFileUrl(filename: string): string {
    // baseUrl 대신 BASE_URL_FOR_FILES 사용
    return `${this.BASE_URL_FOR_FILES}${filename}`;
  }
}