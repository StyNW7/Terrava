import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class BarnInputDto {
  @ApiProperty({ example: 'Barn A' })
  @IsString()
  @MinLength(1)
  name: string;

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5000)
  capacity: number;

  @ApiPropertyOptional({ description: 'Membership id of the barn manager' })
  @IsOptional()
  @IsString()
  managerId?: string;
}

export class CreateFarmDto {
  @ApiProperty({ example: 'Green Valley Farm' })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ example: 'Boyolali, Jawa Tengah' })
  @IsString()
  location: string;

  @ApiProperty({ example: 'Jawa Tengah' })
  @IsString()
  region: string;

  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional({ example: -7.53 }) @IsOptional() @IsLatitude() latitude?: number;
  @ApiPropertyOptional({ example: 110.6 }) @IsOptional() @IsLongitude() longitude?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() @Min(0) areaHectares?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string;
  @ApiPropertyOptional({ description: 'Membership id of the farm manager' })
  @IsOptional()
  @IsString()
  managerId?: string;
  @ApiPropertyOptional({ enum: ['active', 'inactive'] }) @IsOptional() @IsIn(['active', 'inactive']) status?:
    'active' | 'inactive';

  @ApiPropertyOptional({ type: [BarnInputDto], description: 'Barns created together with the farm' })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BarnInputDto)
  barns?: BarnInputDto[];
}

export class UpdateFarmDto extends PartialType(CreateFarmDto) {}

export class UpdateBarnDto extends PartialType(BarnInputDto) {}

export class GeofenceDto {
  @ApiProperty({ example: 'Main paddock' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ enum: ['boundary', 'grazing', 'restricted'], default: 'boundary' })
  @IsOptional()
  @IsIn(['boundary', 'grazing', 'restricted'])
  type?: string;

  @ApiProperty({
    example: [
      [-7.5, 110.6],
      [-7.5, 110.61],
      [-7.51, 110.61],
      [-7.51, 110.6],
    ],
    description: 'Polygon as [lat, lng] pairs',
  })
  @IsArray()
  @ArrayMinSize(3)
  polygon: [number, number][];

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateGeofenceDto extends PartialType(GeofenceDto) {}
