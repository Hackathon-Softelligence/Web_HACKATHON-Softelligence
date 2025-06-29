import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IAlert extends Document {
    studentId: Types.ObjectId;
    examId: Types.ObjectId;
    alertAt: Date;
    recording: string;
}

const alertSchema: Schema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
    alertAt: { type: Date, default: Date.now },
    recording: String,
});

export default mongoose.model<IAlert>('Alert', alertSchema);