import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ISubmission extends Document {
    studentId: Types.ObjectId;
    examId: Types.ObjectId;
    answers: string[];
}

const submissionSchema: Schema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    examId: { type: Schema.Types.ObjectId, ref: 'Exam' },
    answers: [String],
});

export default mongoose.model<ISubmission>('Submission', submissionSchema);