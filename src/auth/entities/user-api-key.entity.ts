/**
 * @fileoverview User API Key entity
 * @module auth/entities/user-api-key.entity
 */

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

/**
 * User API Key entity
 * Represents the user_api_keys table in the jpay schema
 */
@Entity({ name: 'user_api_keys', schema: 'jpay' })
export class UserApiKey {
  /**
   * Primary key - auto-generated ID
   */
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * User ID from Supabase Auth
   */
  @Column({ name: 'user_id', type: 'uuid' })
  userId: string;

  /**
   * Hashed API key (SHA-256)
   */
  @Column({ name: 'key_hash', type: 'text', unique: true })
  keyHash: string;

  /**
   * Whether the API key is active
   */
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Last time the API key was used
   */
  @Column({ name: 'last_used_at', type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  /**
   * Creation timestamp
   */
  @CreateDateColumn()
  createdAt: Date;

  /**
   * Last update timestamp
   */
  @UpdateDateColumn()
  updatedAt: Date;
}
