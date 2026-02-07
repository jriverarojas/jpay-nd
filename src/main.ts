/**
 * @fileoverview Main entry point for the NestJS application
 * @module main
 */

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

/**
 * Bootstrap function to initialize and start the NestJS application
 * Port is configurable via PORT environment variable (default: 3000)
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);

  // Enable validation pipe globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

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

    // Extract origin domain (without protocol)
    const originDomain = origin.replace(/^https?:\/\//, '').toLowerCase();
    const originProtocol = origin.startsWith('https://') ? 'https://' : 'http://';

    // Check each configured origin/pattern
    for (const pattern of corsConfig) {
      const normalizedPattern = pattern.toLowerCase().trim();

      // Exact match (with or without protocol)
      if (normalizedPattern === origin.toLowerCase() || normalizedPattern === originDomain) {
        return callback(null, true);
      }

      // Wildcard pattern: *.example.com (allows all subdomains, but NOT the base domain)
      if (normalizedPattern.startsWith('*.')) {
        const domain = normalizedPattern.substring(2); // Remove '*.'
        
        // Check if origin is a subdomain (e.g., app1.example.com ends with .example.com)
        // But NOT the base domain (example.com itself)
        if (originDomain !== domain && originDomain.endsWith(`.${domain}`)) {
          return callback(null, true);
        }
      }

      // Domain pattern without wildcard: example.com (allows example.com AND all subdomains)
      if (!normalizedPattern.includes('*') && !normalizedPattern.startsWith('http')) {
        const domain = normalizedPattern;
        
        // Check if origin is the domain or any subdomain
        if (originDomain === domain || originDomain.endsWith(`.${domain}`)) {
          return callback(null, true);
        }
      }

      // Pattern with protocol: https://*.example.com or http://*.example.com
      if (normalizedPattern.includes('*') && (normalizedPattern.startsWith('http://') || normalizedPattern.startsWith('https://'))) {
        const [protocol, rest] = normalizedPattern.split('://');
        if (rest?.startsWith('*.')) {
          const domain = rest.substring(2); // Remove '*.'
          
          // For wildcard with protocol, only allow subdomains (not base domain)
          if (originProtocol === `${protocol}://` && originDomain !== domain && originDomain.endsWith(`.${domain}`)) {
            return callback(null, true);
          }
        }
      }

      // Pattern with protocol but no wildcard: https://example.com
      if (!normalizedPattern.includes('*') && (normalizedPattern.startsWith('http://') || normalizedPattern.startsWith('https://'))) {
        const [protocol, rest] = normalizedPattern.split('://');
        const domain = rest;
        
        // Allow exact match with protocol
        if (originProtocol === `${protocol}://` && originDomain === domain) {
          return callback(null, true);
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
