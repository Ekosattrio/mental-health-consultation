import { User as UserEntity, UserRole, UserStatus } from '../types';

/**
 * Base User Model (OOP)
 * Encapsulates core user identity, role permissions, and common behavioral methods.
 */
export class User {
  protected _id: string;
  protected _email: string;
  protected _name: string;
  protected _role: UserRole;
  protected _avatar: string;
  protected _status: UserStatus;
  protected _phone?: string;
  protected _isVerified: boolean;
  protected _createdAt: string;

  constructor(data: UserEntity) {
    this._id = data.id;
    this._email = data.email;
    this._name = data.name;
    this._role = data.role;
    this._avatar = data.avatar;
    this._status = data.status;
    this._phone = data.phone;
    this._isVerified = data.isVerified;
    this._createdAt = data.createdAt;
  }

  // Getters (Encapsulation)
  public get id(): string {
    return this._id;
  }
  public get email(): string {
    return this._email;
  }
  public get name(): string {
    return this._name;
  }
  public get role(): UserRole {
    return this._role;
  }
  public get avatar(): string {
    return this._avatar;
  }
  public get status(): UserStatus {
    return this._status;
  }
  public get phone(): string | undefined {
    return this._phone;
  }
  public get isVerified(): boolean {
    return this._isVerified;
  }
  public get createdAt(): string {
    return this._createdAt;
  }

  // Domain behavioral methods (OOP)
  public isPatient(): boolean {
    return this._role === 'PATIENT';
  }

  public isPsychologist(): boolean {
    return this._role === 'PSYCHOLOGIST';
  }

  public isAdmin(): boolean {
    return this._role === 'ADMIN';
  }

  public isActive(): boolean {
    return this._status === 'ACTIVE';
  }

  public isBlocked(): boolean {
    return this._status === 'BLOCKED';
  }

  public canAccess(requiredRole: UserRole): boolean {
    if (this.isAdmin()) return true;
    return this._role === requiredRole;
  }

  public getInitials(): string {
    return this._name
      .split(' ')
      .map(part => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  public getFormattedPhone(): string {
    return this._phone || 'Belum diisi';
  }

  public toJSON(): UserEntity {
    return {
      id: this._id,
      email: this._email,
      name: this._name,
      role: this._role,
      avatar: this._avatar,
      status: this._status,
      phone: this._phone,
      isVerified: this._isVerified,
      createdAt: this._createdAt
    };
  }

  public static create(data: UserEntity): User {
    return new User(data);
  }
}

