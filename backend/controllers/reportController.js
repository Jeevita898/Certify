const PDFDocument = require('pdfkit');
const Activity = require('../models/Activity');
const User = require('../models/User');

const generateFacultyReport = async (req, res) => {
  try {
    const faculty = await User.findById(req.user.id);

    const approvedActivities = await Activity.find({
      facultyId: req.user.id,
      status: 'approved'
    })
      .populate('studentId', 'firstName lastName usn department')
      .sort({ createdAt: -1 });

    const studentMap = {};

    approvedActivities.forEach(activity => {
      if (!activity.studentId) return;

      const studentId = activity.studentId._id.toString();

      if (!studentMap[studentId]) {
        studentMap[studentId] = {
          name: `${activity.studentId.firstName} ${activity.studentId.lastName}`,
          usn: activity.studentId.usn,
          department: activity.studentId.department,
          activities: [],
          totalPoints: 0
        };
      }

      studentMap[studentId].activities.push({
        name: activity.name,
        type: activity.type,
        points: activity.points,
        approvedDate: activity.reviewedAt
          ? new Date(activity.reviewedAt).toLocaleDateString('en-IN')
          : 'N/A'
      });

      studentMap[studentId].totalPoints += activity.points || 0;
    });

    const students = Object.values(studentMap);

    const totalActivities = approvedActivities.length;
    const totalStudents = students.length;
    const overallPoints = students.reduce(
      (sum, student) => sum + student.totalPoints,
      0
    );

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=faculty-report.pdf'
    );

    doc.pipe(res);

    // Header
    doc
      .fontSize(18)
      .text('FACULTY APPROVED STUDENT REPORT', {
        align: 'center'
      });

    doc.moveDown();

    doc.fontSize(11);
    doc.text(`Faculty Name: ${faculty.name}`);
   
    doc.text(`Department: ${faculty.department || 'N/A'}`);
    doc.text(`Generated On: ${new Date().toLocaleDateString('en-IN')}`);

    doc.moveDown();

    // Summary
    doc
      .fontSize(14)
      .text('Summary', { underline: true });

    doc.moveDown(0.5);

    doc.fontSize(11);
    doc.text(`Total Students: ${totalStudents}`);
    doc.text(`Total Approved Certificates: ${totalActivities}`);
    doc.text(`Overall Approved Points: ${overallPoints}`);

    doc.moveDown();

    doc.text('------------------------------------------------------------');
    doc.moveDown();

    // Student-wise report
    if (students.length === 0) {
      doc.text('No approved activities found.');
    }

    students.forEach((student, index) => {
      doc
        .fontSize(13)
        .text(`${index + 1}. ${student.name}`);

      doc.fontSize(10);
      doc.text(`USN: ${student.usn}`);
      doc.text(`Department: ${student.department}`);

      doc.moveDown(0.5);

      doc
        .fontSize(11)
        .text('Approved Activities:', { underline: true });

      student.activities.forEach((activity, i) => {
        doc.fontSize(10);
        doc.text(
          `${i + 1}. ${activity.name} | ${activity.type} | ${activity.points} points | ${activity.approvedDate}`
        );
      });

      doc.moveDown(0.5);

      doc
        .fontSize(11)
        .text(`Total Approved Points: ${student.totalPoints}`);

      doc.moveDown();
      doc.text('------------------------------------------------------------');
      doc.moveDown();
    });

    // Footer
    doc.moveDown();

    doc.fontSize(10);
    doc.text(`Approved By: ${faculty.name}`);
    doc.text('Generated from Certify Management System');
    doc.text('This is a system generated report.');

    doc.end();

  } catch (err) {
    console.error('Faculty report error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while generating report.'
    });
  }
};

module.exports = {
  generateFacultyReport
};