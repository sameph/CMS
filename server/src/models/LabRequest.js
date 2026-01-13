const mongoose = require('mongoose');

const statusEnum = ['requested', 'in_progress', 'completed', 'cancelled'];

const boolMap = (keys) => {
  const o = {};
  keys.forEach((k) => (o[k] = { type: Boolean, default: false }));
  return o;
};

const strMap = (keys) => {
  const o = {};
  keys.forEach((k) => (o[k] = { type: String }));
  return o;
};

const HEMATOLOGY_KEYS = [
  'WBC',
  'DiffN',
  'Hgb',
  'Hct',
  'ESR',
  'RBC',
  'Platelet',
  'BloodGroup',
  'BloodFilm',
  'StoolTest',
  'Consistency',
  'OP',
  'OccultBlood',
];

const URINALYSIS_KEYS = [
  'Colour',
  'Appearance',
  'pH',
  'SG',
  'Protein',
  'Sugar',
  'Ketone',
  'Bilirubin',
  'Nitrate',
  'Urobilinogen',
  'Leucocyte',
  'Blood',
  'Microscopy',
  'EpitCells',
  'WBC',
  'RBC',
  'Casts',
  'HCGTest',
  'Others',
];

const CHEMISTRY_KEYS = [
  'Colour',
  'FBS_RBS',
  'SGOT',
  'SGPT',
  'AlkPhos',
  'Bilirubin_T',
  'Bilirubin_D',
  'BUN',
  'Urea',
  'Creatinine',
  'UricAcid',
  'TProtein',
  'Triglycerides',
  'Cholesterol',
  'HDL_C',
  'LDL_C',
  'Sodium',
  'Potassium',
  'VCT',
];

const SEROLOGY_KEYS = [
  'VDRL',
  'Widal_H',
  'Widal_O',
  'WeilFelix',
  'HPylori',
  'ASOTiter',
  'RF',
  'HVC',
  'Bacteriology',
  'Sample',
  'KOH',
  'GramStaining',
  'WetAFB',
  'AFB',
  'Others',
];

const labRequestSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    patientId: { type: String },
    notes: { type: String },

    // Who requested and who processes
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending', index: true },
    price: { type: Number, default: 0 },

    status: { type: String, enum: statusEnum, default: 'requested' },

    // What tests are requested (checkbox-like booleans)
    requested: {
      hematology: boolMap(HEMATOLOGY_KEYS),
      urinalysis: boolMap(URINALYSIS_KEYS),
      chemistry: boolMap(CHEMISTRY_KEYS),
      serology: boolMap(SEROLOGY_KEYS),
    },

    // Result values filled by lab
    results: {
      hematology: strMap(HEMATOLOGY_KEYS),
      urinalysis: strMap(URINALYSIS_KEYS),
      chemistry: strMap(CHEMISTRY_KEYS),
      serology: strMap(SEROLOGY_KEYS),
    },

    // Normal value / range or Positive/Negative
    normals: {
      hematology: strMap(HEMATOLOGY_KEYS),
      urinalysis: strMap(URINALYSIS_KEYS),
      chemistry: strMap(CHEMISTRY_KEYS),
      serology: strMap(SEROLOGY_KEYS),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LabRequest', labRequestSchema);
module.exports.LAB_KEYS = { HEMATOLOGY_KEYS, URINALYSIS_KEYS, CHEMISTRY_KEYS, SEROLOGY_KEYS };
