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
  private readonly TEMP_UPLOAD_DESTINATION: string; 

  constructor() {
    this.UPLOAD_DESTINATION =
      process.env.UPLOAD_DESTINATION ||
      '/home/gyubuntu/project/media/uploads'; 

    this.BASE_URL_FOR_FILES =
      process.env.BASE_URL_FOR_FILES ||
      'https://gyubuntu.duckdns.org/media/';

    // UPLOAD_DESTINATION 안에 'temp' 서브 디렉토리를 임시 저장소로 사용
    this.TEMP_UPLOAD_DESTINATION = path.join(this.UPLOAD_DESTINATION, 'temp');

    this.mkdir(this.UPLOAD_DESTINATION);
    this.mkdir(this.TEMP_UPLOAD_DESTINATION);
  }

  private mkdir(directoryPath: string) { 
    try {
      if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, { recursive: true });
        console.log(`Directory created: ${directoryPath}`);
      } else {
        console.log(`Directory already exists: ${directoryPath}`);
      }
    } catch (err) {
      console.error(
        `Failed to create directory ${directoryPath}:`,
        err,
      );
      throw new Error(`디렉토리 생성 실패: ${err.message}`);
    }
  }

  createMulterOptions(): multer.Options {
    const option: multer.Options = {
      storage: multer.diskStorage({
        destination: (req, file, done) => {
          done(null, this.TEMP_UPLOAD_DESTINATION); 
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
    return `${this.BASE_URL_FOR_FILES}${filename}`;
  }
}