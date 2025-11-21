import envConfig from '@/config/env.config'
import setupSwagger from '@/config/swagger.config'
import { RequestMethod, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import path from 'path'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const corsOrigin = envConfig.APP_CORS_ORIGIN
  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
    credentials: true
  })
  console.info('CORS Origin:', corsOrigin)

  //serve static uploads FIRST - must be before setGlobalPrefix
  app.useStaticAssets(path.resolve('uploads'), {
    prefix: '/uploads/'
  })

  // Use global prefix if you don't have subdomain
  app.setGlobalPrefix(envConfig.API_PREFIX, {
    exclude: [
      { method: RequestMethod.GET, path: '/' },
      { method: RequestMethod.GET, path: 'health' },
      { method: RequestMethod.GET, path: 'uploads/*' } // Exclude static files from prefix
    ]
  })

  //version
  app.enableVersioning({
    type: VersioningType.URI
  })

  //swagger
  setupSwagger(app)

  await app.listen(envConfig.APP_PORT, '0.0.0.0')

  console.log(`
   ███████╗██████╗  ██████╗ ██████╗ ████████╗ █████╗
   ██╔════╝██╔══██╗██╔═══██╗██╔══██╗╚══██╔══╝██╔══██╗
   ███████ ██████╔╝██║   ██║██████╔╝   ██║   ███████║
        ██ ██╔═══╝ ██║   ██║██╔══██╗   ██║   ██╔══██║
   ███████╗██║     ╚██████╔╝██║  ██║   ██║   ██║  ██║
   ╚══════╝╚═╝      ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝

   🏆 Welcome to SPORTA! 🏆
   ⚡ Powered by NestJS & TypeScript
`)

  console.info(`Server running on ${await app.getUrl()}`)
  console.info(`Swagger docs on ${await app.getUrl()}/api-docs`)
  console.info(`Type: npx prisma studio - to run prisma studio`)

  return app
}
bootstrap()
