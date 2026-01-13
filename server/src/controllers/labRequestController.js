const LabRequest = require('../models/LabRequest');

// Return a static catalog of categories and test keys for the client UI
async function getCatalog(req, res) {
  const { LAB_KEYS } = require('../models/LabRequest');

  const labelMap = {
    // Hematology
    WBC: 'WBC',
    DiffN: 'Diff N',
    Hgb: 'Hgb',
    Hct: 'Hct',
    ESR: 'ESR',
    RBC: 'RBC',
    Platelet: 'Platelet',
    BloodGroup: 'Blood Group',
    BloodFilm: 'Blood Film',
    StoolTest: 'Stool Test',
    Consistency: 'Consistency',
    OP: 'O/P',
    OccultBlood: 'Occult Blood',
    // Urinalysis
    Colour: 'Colour',
    Appearance: 'Appearance',
    pH: 'PH',
    SG: 'SG',
    Protein: 'Protein',
    Sugar: 'Sugar',
    Ketone: 'Ketone',
    Bilirubin: 'Bilirubin',
    Nitrate: 'Nitrate',
    Urobilinogen: 'Urobilinogen',
    Leucocyte: 'Leukocyte',
    Microscopy: 'Microscopy',
    EpitCells: 'Epit Cells',
    Casts: 'Casts',
    HCGTest: 'HCG Test',
    Others: 'Others',
    Blood: 'Blood',
    // Chemistry
    FBS_RBS: 'FBS/RBS',
    SGOT: 'SGOT',
    SGPT: 'SGPT',
    AlkPhos: 'ALK Phos',
    Bilirubin_T: 'Bilirubin (T)',
    Bilirubin_D: 'Bilirubin (D)',
    BUN: 'BUN',
    Urea: 'Urea',
    Creatinine: 'Creatinine',
    UricAcid: 'Uric Acid',
    TProtein: 'T. Protein',
    Triglycerides: 'Triglycerides',
    Cholesterol: 'Cholesterol',
    HDL_C: 'HDL-C',
    LDL_C: 'LDL-C',
    Sodium: 'Sodium',
    Potassium: 'Potassium',
    VCT: 'VCT',
    // Serology
    VDRL: 'VDRL',
    Widal_H: 'Widal H',
    Widal_O: 'Widal O',
    WeilFelix: 'Well Felix',
    HPylori: 'H. Pylori',
    ASOTiter: 'ASO Titer',
    RF: 'RF',
    HVC: 'HVC',
    Bacteriology: 'Bacteriology',
    Sample: 'Sample',
    KOH: 'KOH',
    GramStaining: 'Gram Staining',
    WetAFB: 'Wet AFB',
    AFB: 'AFB',
  };

  const toLabeled = (keys) => keys.map((key) => ({ key, label: labelMap[key] || key }));

  return res.json({
    categories: {
      hematology: LAB_KEYS.HEMATOLOGY_KEYS,
      urinalysis: LAB_KEYS.URINALYSIS_KEYS,
      chemistry: LAB_KEYS.CHEMISTRY_KEYS,
      serology: LAB_KEYS.SEROLOGY_KEYS,
    },
    labels: {
      hematology: toLabeled(LAB_KEYS.HEMATOLOGY_KEYS),
      urinalysis: toLabeled(LAB_KEYS.URINALYSIS_KEYS),
      chemistry: toLabeled(LAB_KEYS.CHEMISTRY_KEYS),
      serology: toLabeled(LAB_KEYS.SEROLOGY_KEYS),
    },
  });
}

// Create a new lab request (OPD role)
async function createRequest(req, res) {
  try {
    const {
      patientName,
      patientId,
      notes,
      requested = {},
    } = req.body || {};

    if (!patientName) return res.status(400).json({ message: 'patientName required' });

    const doc = await LabRequest.create({
      patientName,
      patientId,
      notes,
      requestedBy: req.user._id,
      requested,
    });

    return res.status(201).json(doc);
  } catch (err) {
    console.error('createRequest error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// List lab requests
// - laboratory: see all
// - opd: see self requested
async function listRequests(req, res) {
  try {
    const q = req.user.role === 'laboratory' ? { paymentStatus: 'paid' } : { requestedBy: req.user._id };
    if (req.query && req.query.patientId) {
      q.patientId = req.query.patientId;
    }
    const docs = await LabRequest.find(q)
      .sort({ createdAt: -1 })
      .populate('requestedBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .lean();
    return res.json(docs);
  } catch (err) {
    console.error('listRequests error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

async function getRequest(req, res) {
  try {
    const doc = await LabRequest.findById(req.params.id)
      .populate('requestedBy', 'name email role')
      .populate('assignedTo', 'name email role');
    if (!doc) return res.status(404).json({ message: 'Not found' });

    if (req.user.role !== 'laboratory' && String(doc.requestedBy._id) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.json(doc);
  } catch (err) {
    console.error('getRequest error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

// Update results/status (laboratory role)
async function updateRequest(req, res) {
  try {
    const { results, normals, status, assignedTo } = req.body || {};
    const doc = await LabRequest.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });

    if (typeof results === 'object') doc.results = { ...doc.results, ...results };
    if (typeof normals === 'object') doc.normals = { ...doc.normals, ...normals };
    if (typeof status === 'string') doc.status = status;
    if (assignedTo) doc.assignedTo = assignedTo;

    await doc.save();
    return res.json(doc);
  } catch (err) {
    console.error('updateRequest error', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
  getCatalog,
  createRequest,
  listRequests,
  getRequest,
  updateRequest,
};
