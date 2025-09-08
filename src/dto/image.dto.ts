import { IsArray, IsOptional, IsString } from 'class-validator';

export class ImageDto {

  @IsString()
  serviceName: string;

  @IsString()
  id: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  existingImages: string[];

  @IsString()
  entity: string;
}
