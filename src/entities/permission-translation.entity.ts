/**
 * @fileoverview Permission Translation entity
 * @module entities/permission-translation.entity
 */

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Permission } from './permission.entity';

/**
 * PermissionTranslation entity
 * Represents the permission_translation table in the jpay schema
 */
@Entity({ name: 'permission_translation', schema: 'jpay' })
export class PermissionTranslation {
  /**
   * Primary key - UUID
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Foreign key to Permission
   */
  @Column({ name: 'permission_id', type: 'uuid' })
  permissionId: string;

  /**
   * ISO language code
   * Examples: en, es, pt, etc.
   */
  @Column({ name: 'language_code', type: 'varchar', length: 10 })
  languageCode: string;

  /**
   * Menu label / permission label
   */
  @Column({ type: 'varchar', length: 255 })
  label: string;

  /**
   * Optional longer description
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string | null;

  /**
   * Creation timestamp
   */
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  /**
   * Many-to-one relationship with Permission
   */
  @ManyToOne(() => Permission, (permission) => permission.translations, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}
