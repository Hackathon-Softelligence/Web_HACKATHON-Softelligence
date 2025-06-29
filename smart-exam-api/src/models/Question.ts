import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IQuestion extends Document {
    examId: Types.ObjectId;
    question: string;
    options: string[];
    correctOption: string;
}

const questionSchema: Schema = new Schema({
    examId: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
    question: String,
    options: [String],
    correctOption: String
});

export default mongoose.model<IQuestion>('Question', questionSchema);
