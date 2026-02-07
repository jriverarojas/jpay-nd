/**
 * @fileoverview Main entry point for the NestJS application
 * @module main
 */

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

/**
 * Bootstrap function to initialize and start the NestJS application
 * Port is configurable via PORT environment variable (default: 3000)
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Enable CORS for frontend
  // CORS origins can be configured via CORS_ORIGINS environment variable (comma-separated)
  // Supports wildcards: *.example.com allows all subdomains of example.com
  // Default: http://localhost:5173,http://localhost:5174 (for development)
  const corsOrigins = configService.get<string>('CORS_ORIGINS', 'http://localhost:5173,http://localhost:5174');
  const corsConfig = corsOrigins.split(',').map(origin => origin.trim()).filter(origin => origin.length > 0);
  
  // Function to validate origin against allowed patterns
  const originValidator = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      return callback(null, false);
    }

    // If no CORS config, allow all (development)
    if (corsConfig.length === 0) {
      return callback(null, true);
    }

    // Check each configured origin/pattern
    for (const pattern of corsConfig) {
      // Exact match
      if (pattern === origin) {
        return callback(null, true);
      }

      // Wildcard pattern: *.example.com (allows all subdomains, but NOT the base domain)
      if (pattern.startsWith('*.')) {
        const domain = pattern.substring(2); // Remove '*.'
        const originDomain = origin.replace(/^https?:\/\//, '');
        // Check if origin is a subdomain (e.g., app1.example.com ends with .example.com)
        // But NOT the base domain (example.com itself)
        if (originDomain !== domain && originDomain.endsWith(`.${domain}`)) {
          return callback(null, true);
        }
      }

      // Domain pattern without wildcard: example.com (allows example.com AND all subdomains)
      if (!pattern.includes('*') && !pattern.startsWith('http')) {
        const domain = pattern;
        const originDomain = origin.replace(/^https?:\/\//, '');
        // Check if origin is the domain or any subdomain
        if (originDomain === domain || originDomain.endsWith(`.${domain}`)) {
          return callback(null, true);
        }
      }

      // Pattern with protocol: https://*.example.com
      if (pattern.includes('*') && (pattern.startsWith('http://') || pattern.startsWith('https://'))) {
        const [protocol, rest] = pattern.split('://');
        if (rest?.startsWith('*.')) {
          const domain = rest.substring(2);
          const originProtocol = origin.startsWith('https://') ? 'https://' : 'http://';
          const originDomain = origin.replace(/^https?:\/\//, '');
          
          if (originProtocol === `${protocol}://` && (originDomain === domain || originDomain.endsWith(`.${domain}`))) {
            return callback(null, true);
          }
        }
      }
    }

    // No match found
    callback(null, false);
  };
  
  app.enableCors({
    origin: corsConfig.length > 0 ? originValidator : true, // Use validator function or allow all
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language', 'x-api-key'],
  });  

  await app.listen(port);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap();
