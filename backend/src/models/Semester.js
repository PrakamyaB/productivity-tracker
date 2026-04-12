const mongoose = require('mongoose');

const subjectGradeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  credits: { type: Number, required: true, min: 0.5, max: 10 },
  grade: { type: String, required: true }, // 'O', 'A+', 'A', 'B+', 'B', 'C', 'F'
  gradePoint: { type: Number, required: true },
  marks: { type: Number, default: null },
});

const semesterSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  semesterName: { type: String, required: true }, // "Semester 1", "Fall 2024"
  semesterNumber: { type: Number, required: true },
  subjects: [subjectGradeSchema],
  sgpa: { type: Number, default: 0 },
  totalCredits: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Grade point mappings (10-point scale, common in India)
const GRADE_POINTS = {
  'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'F': 0,
  // US scale
  'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7, 'C+': 2.3, 'C': 2.0, 'D': 1.0,
};

module.exports = mongoose.model('Semester', semesterSchema);
module.exports.GRADE_POINTS = GRADE_POINTS;
