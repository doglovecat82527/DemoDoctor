const fs = require('fs');
const path = require('path');

// 读取病例数据
const patientCasesPath = path.join(__dirname, '../data/patient-cases.json');
const presetDiagnosisPath = path.join(__dirname, '../data/preset-diagnosis.json');

const patientCases = JSON