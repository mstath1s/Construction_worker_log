import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'worker';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: ['admin', 'manager', 'worker'], 
      default: 'worker' 
    },
  },
  { timestamps: true }
);

// Prevent model overwrite error during hot reloading in development
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 