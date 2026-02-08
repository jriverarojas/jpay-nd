/**
 * @fileoverview Request Log entity for storing HTTP request logs
 * @module entities/request-log.entity
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * RequestLog entity
 * Represents the request_log table in the jpay schema
 * Stores HTTP request information for auditing and debugging
 */
@Entity({ name: 'request_log', schema: 'jpay' })
export class RequestLog {
  /**
   * Primary key - UUID
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * HTTP method (GET, POST, PUT, DELETE, etc.)
   */
  @Column({ type: 'varchar', length: 10 })
  method: string;

  /**
   * Request URL
   */
  @Column({ type: 'varchar', length: 2048 })
  url: string;

  /**
   * Request path (without query string)
   */
  @Column({ type: 'varchar', length: 2048 })
  path: string;

  /**
   * Query string parameters (JSON)
   */
  @Column({ type: 'jsonb', nullable: true })
  query: Record<string, any> | null;

  /**
   * Request headers (JSON, excluding sensitive data)
   */
  @Column({ type: 'jsonb', nullable: true })
  headers: Record<string, any> | null;

  /**
   * Request body (JSON, truncated if too large)
   */
  @Column({ type: 'text', nullable: true })
  body: string | null;

  /**
   * Response status code
   */
  @Column({ type: 'integer', nullable: true })
  statusCode: number | null;

  /**
   * Response body (JSON, truncated if too large)
   */
  @Column({ type: 'text', nullable: true })
  responseBody: string | null;

  /**
   * Response time in milliseconds
   */
  @Column({ type: 'integer', nullable: true })
  responseTime: number | null;

  /**
   * User ID (if authenticated)
   */
  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @Index('IDX_request_log_user_id')
  userId: string | null;

  /**
   * User external ID (from Supabase)
   */
  @Column({ name: 'user_external_id', type: 'varchar', length: 255, nullable: true })
  @Index('IDX_request_log_user_external_id')
  userExternalId: string | null;

  /**
   * IP address of the client
   */
  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  /**
   * User agent string
   */
  @Column({ name: 'user_agent', type: 'varchar', length: 512, nullable: true })
  userAgent: string | null;

  /**
   * Error message (if request failed)
   */
  @Column({ type: 'text', nullable: true })
  error: string | null;

  /**
   * Error stack trace (if request failed)
   */
  @Column({ name: 'error_stack', type: 'text', nullable: true })
  errorStack: string | null;

  /**
   * Creation timestamp
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  @Index('IDX_request_log_created_at')
  createdAt: Date;
}
