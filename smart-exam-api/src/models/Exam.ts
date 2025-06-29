import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IExam extends Document {
    name: string;
    startTime: Date;
    endTime: Date;
    candidates: Types.ObjectId[];
    status: string;
    room: string;
}

const examSchema: Schema = new Schema({
    name: String,
    startTime: Date,
    endTime: Date,
    candidates: [{ type: Schema.Types.ObjectId, ref: 'Student' }],
    status: String,
    room: String,
});

export default mongoose.model<IExam>('Exam', examSchema);