import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IStudent extends Document {
    name: string;
    avatar: string;
}

const studentSchema: Schema = new Schema({
    name: { type: String, required: true },
    avatar: { type: String, required: true },
});

export default mongoose.model<IStudent>('Student', studentSchema);