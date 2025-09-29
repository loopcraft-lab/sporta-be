import envConfig from '@/config/env.config'
import { HttpExceptionFilter } from '@/shared/filters/http-exception.filter'
import CustomZodValidationPipe from '@/shared/pipes/custom-zod-validation.pipe'
import { createKeyv } from '@keyv/redis'
import { BullModule } from '@nestjs/bullmq'
import { CacheModule } from '@nestjs/cache-manager'
import { Module } from '@nestjs/common'
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { AuthModule } from './routes/auth/auth.module'
import { LocationModule } from './routes/location/location.module'
import { MediaModule } from './routes/media/media.module'
import { PermissionModule } from './routes/permission/permission.module'
import { RoleModule } from './routes/role/role.module'
import { SportProfileModule } from './routes/sport-profile/sport-profile.module'
import { SportModule } from './routes/sport/sport.module'
import { UserModule } from './routes/user/user.module'
import { SharedModule } from './shared/shared.module'

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [createKeyv(envConfig.REDIS_URL)]
        }
      }
    }),
    BullModule.forRoot({
      connection: {
        url: envConfig.REDIS_URL
      }
    }),
    SharedModule,
    UserModule,
    RoleModule,
    PermissionModule,
    AuthModule,
    SportModule,
    SportProfileModule,
    LocationModule,
    MediaModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter
    }
  ]
})
export class AppModule {}
