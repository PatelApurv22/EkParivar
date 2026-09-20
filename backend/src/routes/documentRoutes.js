const express = require('express');
const router = express.Router();
const multer = require('multer');
const Document = require('../models/Document');
const { uploadToCloudinary } = require('../services/cloudinaryService');
const { logAudit } = require('../services/auditService');

// Multer in-memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB file size limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype) || file.originalname.match(/\.(pdf|jpg|jpeg|png)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only PDF, JPG, JPEG, and PNG files are allowed.'));
    }
  }
});

// POST /api/documents/upload - Upload document file to Cloudinary & store metadata in MongoDB
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { familyId, documentType, memberId } = req.body;
    if (!familyId || !documentType) {
      return res.status(400).json({
        success: false,
        message: 'familyId and documentType are required fields.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded. Please select a valid PDF, JPG, JPEG, or PNG file.'
      });
    }

    // Upload file buffer to Cloudinary
    const cloudinaryRes = await uploadToCloudinary(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype
    );

    // Upsert or create new document record for this family & documentType
    let docRecord = await Document.findOne({ familyId, documentType });

    if (docRecord) {
      // Replace existing document file
      docRecord.fileName = req.file.originalname;
      docRecord.fileUrl = cloudinaryRes.fileUrl;
      docRecord.publicId = cloudinaryRes.publicId;
      docRecord.fileType = cloudinaryRes.fileType;
      docRecord.uploadedAt = new Date();
      docRecord.status = 'pending';
      docRecord.rejectionReason = null;
      docRecord.verifiedBy = null;
      docRecord.verifiedAt = null;
      if (memberId) docRecord.memberId = memberId;
    } else {
      docRecord = new Document({
        familyId,
        memberId: memberId || null,
        documentType,
        fileName: req.file.originalname,
        fileUrl: cloudinaryRes.fileUrl,
        publicId: cloudinaryRes.publicId,
        fileType: cloudinaryRes.fileType,
        uploadedAt: new Date(),
        status: 'pending'
      });
    }

    await docRecord.save();

    await logAudit({
      actorType: 'Family',
      actorName: familyId,
      action: 'uploaded_document',
      targetType: 'Document',
      targetId: docRecord._id.toString(),
      details: {
        familyId,
        documentType,
        fileName: docRecord.fileName,
        fileUrl: docRecord.fileUrl
      }
    });

    res.status(201).json({
      success: true,
      document: docRecord,
      message: `Document "${documentType}" uploaded successfully.`
    });
  } catch (err) {
    console.error('Error uploading document:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Failed to upload document'
    });
  }
});

// GET /api/documents/family/:familyId - Get all uploaded documents for a family
router.get('/family/:familyId', async (req, res) => {
  try {
    const { familyId } = req.params;
    let documents = await Document.find({ familyId }).sort({ createdAt: -1 });

    if (documents.length === 0) {
      // Auto-aggregate documents from Family, FamilyApplication & Members
      const Family = require('../models/Family');
      const FamilyApplication = require('../models/FamilyApplication');
      const Member = require('../models/Member');

      const family = await Family.findOne({ familyId });
      const app = await FamilyApplication.findOne({ $or: [{ issuedFamilyId: familyId }, { applicationRefNo: familyId }] });
      const members = await Member.find({ familyId });

      const autoDocs = [];

      if (app && app.documents) {
        for (const d of app.documents) {
          autoDocs.push({
            familyId,
            documentType: d.documentType === 'income_cert' ? 'Income Certificate' : d.documentType === 'ration_card' ? 'Ration Card' : d.documentType === 'aadhaar_card' ? 'Aadhaar Card' : (d.documentType || 'Income Certificate'),
            fileName: d.fileName || 'Document.pdf',
            fileUrl: d.fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            publicId: `mock_app_${familyId}_${Math.random()}`,
            fileType: 'pdf',
            status: 'pending'
          });
        }
      }

      if (family && family.documents) {
        for (const d of family.documents) {
          autoDocs.push({
            familyId,
            documentType: d.documentType === 'income_cert' ? 'Income Certificate' : d.documentType === 'ration_card' ? 'Ration Card' : (d.documentType || 'Address Proof'),
            fileName: d.fileName || `${d.documentType || 'Family_Proof'}.pdf`,
            fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
            publicId: `mock_fam_${familyId}_${Math.random()}`,
            fileType: 'pdf',
            status: d.verified ? 'verified' : 'pending'
          });
        }
      }

      for (const m of members) {
        if (m.documents && m.documents.length > 0) {
          for (const d of m.documents) {
            autoDocs.push({
              familyId,
              memberId: m._id,
              documentType: d.name || (d.documentType === 'aadhaar_card' ? 'Aadhaar Card' : d.documentType || 'Aadhaar Card'),
              fileName: `${m.name.replace(/\s+/g, '_')}_Aadhaar.pdf`,
              fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
              publicId: `mock_mem_${m._id}_${Math.random()}`,
              fileType: 'pdf',
              status: d.verified ? 'verified' : 'pending'
            });
          }
        }
      }

      // If still empty, add standard default income & ration card proof
      if (autoDocs.length === 0) {
        autoDocs.push({
          familyId,
          documentType: 'Income Certificate',
          fileName: `Income_Certificate_${familyId}.pdf`,
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          publicId: `mock_default_inc_${familyId}`,
          fileType: 'pdf',
          status: 'pending'
        });
        autoDocs.push({
          familyId,
          documentType: 'Aadhaar Card',
          fileName: `Aadhaar_Card_${familyId}.pdf`,
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          publicId: `mock_default_adh_${familyId}`,
          fileType: 'pdf',
          status: 'pending'
        });
      }

      // Insert aggregated documents
      documents = await Document.insertMany(autoDocs);
    }

    res.json({
      success: true,
      documents
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/documents/:id - Get single document by ID
router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }
    res.json({
      success: true,
      document
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/documents/:id/verify - Officer verifies a document
router.post('/:id/verify', async (req, res) => {
  try {
    const { officerName } = req.body;
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    document.status = 'verified';
    document.verifiedBy = officerName || 'Government Officer';
    document.verifiedAt = new Date();
    document.rejectionReason = null;
    await document.save();

    await logAudit({
      actorType: 'Officer',
      actorName: officerName || 'Government Officer',
      action: 'verified_document',
      targetType: 'Document',
      targetId: document._id.toString(),
      details: {
        familyId: document.familyId,
        documentType: document.documentType,
        fileName: document.fileName
      }
    });

    res.json({
      success: true,
      document,
      message: `Document "${document.documentType}" verified successfully.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/documents/:id/reject - Officer rejects a document (requires rejection reason)
router.post('/:id/reject', async (req, res) => {
  try {
    const { reason, officerName } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required to reject a document.'
      });
    }

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ success: false, message: 'Document not found' });
    }

    document.status = 'rejected';
    document.rejectionReason = reason.trim();
    document.verifiedBy = officerName || 'Government Officer';
    document.verifiedAt = new Date();
    await document.save();

    await logAudit({
      actorType: 'Officer',
      actorName: officerName || 'Government Officer',
      action: 'rejected_document',
      targetType: 'Document',
      targetId: document._id.toString(),
      details: {
        familyId: document.familyId,
        documentType: document.documentType,
        reason: document.rejectionReason
      }
    });

    res.json({
      success: true,
      document,
      message: `Document "${document.documentType}" rejected.`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/documents/all - Officer Document Verification Vault (Get all documents)
router.get('/all', async (req, res) => {
  try {
    const { status, documentType } = req.query;
    const filter = {};
    if (status && status !== 'All') filter.status = status;
    if (documentType && documentType !== 'All') filter.documentType = documentType;

    let documents = await Document.find(filter).sort({ createdAt: -1 });

    if (documents.length === 0 && !status && !documentType) {
      // Auto populate initial documents if vault is empty
      const Family = require('../models/Family');
      const Member = require('../models/Member');
      const FamilyApplication = require('../models/FamilyApplication');

      const families = await Family.find();
      const apps = await FamilyApplication.find();
      const members = await Member.find();

      const seedDocs = [];

      for (const fam of families) {
        seedDocs.push({
          familyId: fam.familyId,
          documentType: 'Income Certificate',
          fileName: `Income_Certificate_${fam.headOfFamilyName.replace(/\s+/g, '_')}.pdf`,
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          publicId: `seed_inc_${fam.familyId}`,
          fileType: 'pdf',
          status: 'pending'
        });
        seedDocs.push({
          familyId: fam.familyId,
          documentType: 'Ration Card',
          fileName: `Ration_Card_${fam.rationCardNo || fam.familyId}.pdf`,
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          publicId: `seed_rc_${fam.familyId}`,
          fileType: 'pdf',
          status: 'verified'
        });
      }

      for (const app of apps) {
        seedDocs.push({
          familyId: app.issuedFamilyId || app.applicationRefNo,
          documentType: 'Aadhaar Card',
          fileName: `Aadhaar_${app.headOfFamilyName.replace(/\s+/g, '_')}.pdf`,
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          publicId: `seed_adh_${app.applicationRefNo}`,
          fileType: 'pdf',
          status: 'pending'
        });
      }

      for (const m of members) {
        seedDocs.push({
          familyId: m.familyId,
          memberId: m._id,
          documentType: 'Aadhaar Card',
          fileName: `Aadhaar_${m.name.replace(/\s+/g, '_')}.pdf`,
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          publicId: `seed_mem_adh_${m._id}`,
          fileType: 'pdf',
          status: m.aadhaarVerified ? 'verified' : 'pending'
        });
      }

      if (seedDocs.length > 0) {
        documents = await Document.insertMany(seedDocs);
      }
    }

    res.json({
      success: true,
      documents
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
