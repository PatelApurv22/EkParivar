/**
 * EkParivar Eligibility Engine
 * Pure function to check member & family eligibility against scheme rules.
 */

export function calculateAge(dobString) {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const diffMs = Date.now() - dob.getTime();
  const ageDate = new Date(diffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function checkLevelMatch(level, rule) {
  if (!level) return false;
  if (!rule.requiredClassRange && !rule.minEducationLevel) return true;

  const lvl = level.toLowerCase();

  if (rule.requiredClassRange) {
    const range = rule.requiredClassRange.toLowerCase();
    if (range.includes('10-12') || range.includes('10 to 12')) {
      return lvl.includes('10') || lvl.includes('12');
    }
    if (range.includes('10')) return lvl.includes('10');
    if (range.includes('12')) return lvl.includes('12');
    if (range.includes('diploma')) return lvl.includes('diploma');
    if (range.includes('undergraduate') || range.includes('ug')) return lvl.includes('undergraduate') || lvl.includes('diploma');
  }

  if (rule.minEducationLevel) {
    const minLvl = rule.minEducationLevel.toLowerCase();
    if (minLvl.includes('10')) {
      return lvl.includes('10') || lvl.includes('12') || lvl.includes('diploma') || lvl.includes('undergraduate') || lvl.includes('postgraduate');
    }
    if (minLvl.includes('12')) {
      return lvl.includes('12') || lvl.includes('diploma') || lvl.includes('undergraduate') || lvl.includes('postgraduate');
    }
  }

  return true;
}

export function checkEligibility(member, family, scheme) {
  const rule = scheme.rule || scheme;
  const matchedCriteria = [];
  const missingCriteria = [];
  let isEligible = true;

  const age = calculateAge(member.dob);
  const income = family ? family.totalIncome : (member.monthlyIncome * 12);

  // 1. Income Check
  if (rule.maxIncome != null && rule.maxIncome > 0) {
    if (income <= rule.maxIncome) {
      matchedCriteria.push(`Family annual income (₹${income.toLocaleString('en-IN')}) is below maximum limit ₹${rule.maxIncome.toLocaleString('en-IN')}`);
    } else {
      isEligible = false;
      missingCriteria.push(`Annual income ₹${income.toLocaleString('en-IN')} exceeds maximum allowed ₹${rule.maxIncome.toLocaleString('en-IN')}`);
    }
  }

  // 2. Age Check
  if (rule.minAge != null || rule.maxAge != null) {
    const min = rule.minAge || 0;
    const max = rule.maxAge || 120;
    if (age >= min && age <= max) {
      matchedCriteria.push(`Member age (${age} yrs) is within eligible range (${min}-${max} yrs)`);
    } else {
      isEligible = false;
      missingCriteria.push(`Member age (${age} yrs) outside required range ${min}-${max} yrs`);
    }
  }

  // 3. Gender Check
  if (rule.requiredGender && rule.requiredGender !== 'Any') {
    if (member.gender === rule.requiredGender) {
      const genderLabel = member.gender === 'F' ? 'Female' : member.gender === 'M' ? 'Male' : 'Other';
      matchedCriteria.push(`Gender criterion met (${genderLabel})`);
    } else {
      isEligible = false;
      const reqLabel = rule.requiredGender === 'F' ? 'Female' : 'Male';
      missingCriteria.push(`Requires ${reqLabel} gender`);
    }
  }

  // 4. Category Check
  if (rule.requiredCategory && Array.isArray(rule.requiredCategory) && rule.requiredCategory.length > 0) {
    const familyCat = family ? family.category : 'General';
    if (rule.requiredCategory.includes(familyCat)) {
      matchedCriteria.push(`Category '${familyCat}' is eligible`);
    } else {
      isEligible = false;
      missingCriteria.push(`Category '${familyCat}' not in eligible list (${rule.requiredCategory.join(', ')})`);
    }
  }

  // 5. BPL / Ration Card Check
  if (rule.requiresBPL) {
    const card = family ? family.rationCardType : 'None';
    if (['BPL', 'AAY'].includes(card)) {
      matchedCriteria.push(`BPL/AAY Ration Card status verified (${card})`);
    } else {
      isEligible = false;
      missingCriteria.push(`Requires BPL or AAY Ration Card (Current: ${card})`);
    }
  }

  // 6. Widow Check
  if (rule.requiresWidow) {
    if (member.isWidow) {
      matchedCriteria.push(`Widow status verified`);
    } else {
      isEligible = false;
      missingCriteria.push(`Scheme requires Widow marital status`);
    }
  }

  // 7. Disability Check
  if (rule.requiresDisabled) {
    const minDis = rule.minDisabilityPercent || 0;
    if (member.isDisabled && (member.disabilityPercent || 0) >= minDis) {
      matchedCriteria.push(`Disabled person status verified (${member.disabilityPercent || 0}% disability >= min ${minDis}%)`);
    } else {
      isEligible = false;
      missingCriteria.push(`Requires disability certificate (min ${minDis}%)`);
    }
  }

  // 8. Pregnancy / Lactation Check
  if (rule.requiresPregnantOrLactating) {
    if (member.isPregnantOrLactating) {
      matchedCriteria.push(`Pregnant / Lactating mother status verified`);
    } else {
      isEligible = false;
      missingCriteria.push(`Requires Pregnant or Lactating mother status`);
    }
  }

  // 9. Occupation Check
  if (rule.requiredOccupation && rule.requiredOccupation.trim() !== '') {
    const memberOcc = (member.occupation || '').toLowerCase();
    const reqOcc = rule.requiredOccupation.toLowerCase();
    if (memberOcc.includes(reqOcc) || (reqOcc === 'student' && member.currentlyEnrolled)) {
      matchedCriteria.push(`Occupation requirement met (${rule.requiredOccupation})`);
    } else {
      isEligible = false;
      missingCriteria.push(`Requires occupation: ${rule.requiredOccupation}`);
    }
  }

  // 10. Education Percent Check (Searches educationRecords array)
  if (rule.minEducationPercent != null && rule.minEducationPercent > 0) {
    const records = member.educationRecords || [];
    
    // Also support fallback for legacy flat fields
    if (records.length === 0 && member.educationPercent != null) {
      records.push({ level: member.educationLevel || 'Class 12', percentage: member.educationPercent });
    }

    const qualifyingRecord = records.find(rec => {
      const isLevelMatch = checkLevelMatch(rec.level, rule);
      const isPctMatch = Number(rec.percentage || 0) >= rule.minEducationPercent;
      return isLevelMatch && isPctMatch;
    });

    if (qualifyingRecord) {
      matchedCriteria.push(`Academic record (${qualifyingRecord.level}: ${qualifyingRecord.percentage}%) satisfies required ${rule.minEducationPercent}% score`);
    } else if (records.length > 0) {
      isEligible = false;
      const maxScore = Math.max(...records.map(r => Number(r.percentage || 0)));
      missingCriteria.push(`Academic performance (highest: ${maxScore}%) below required ${rule.minEducationPercent}% for specified level`);
    } else {
      isEligible = false;
      missingCriteria.push(`No education records meeting minimum required ${rule.minEducationPercent}%`);
    }
  }

  // Missing Document Detection
  const memberDocs = (member.documents || []).map(d => d.documentType);
  const familyDocs = family ? (family.documents || []).map(d => d.documentType) : [];
  const availableDocs = new Set([...memberDocs, ...familyDocs]);

  const requiredDocList = scheme.requiredDocuments || ["aadhaar_card", "income_cert"];
  const missingDocuments = requiredDocList.filter(docType => !availableDocs.has(docType));

  return {
    isEligible,
    matchedCriteria,
    missingCriteria,
    missingDocuments
  };
}
