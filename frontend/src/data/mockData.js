// EkParivar - Initial Mock Data for Hackathon Demonstration

export const MOCK_FAMILIES = [
  {
    _id: "fam_001",
    familyId: "EKP-20260920-0001",
    headOfFamilyName: "Rameshchandra Patel",
    address: {
      houseNo: "B-402, Shivam Enclave",
      street: "Ashram Road",
      village: "Navrangpura",
      taluka: "Ahmedabad City",
      district: "Ahmedabad",
      state: "Gujarat",
      pincode: "380009"
    },
    rationCardNo: "RC-GUJ-8827491",
    rationCardType: "BPL",
    totalIncome: 180000,
    incomeSource: "Agriculture & Daily Wage",
    category: "OBC",
    religion: "Hinduism",
    mobile: "9876543210",
    email: "ramesh.patel@example.com",
    bankDetails: {
      accountHolderName: "Rameshchandra Patel",
      accountNumber: "50100293847561",
      ifscCode: "SBIN0001234",
      bankName: "State Bank of India",
      branch: "Navrangpura, Ahmedabad",
      linkedToAadhaar: true
    },
    documents: [
      { documentType: "income_cert", documentNumber: "INC-2025-9831", verified: true, name: "Income Certificate" },
      { documentType: "ration_card", documentNumber: "RC-GUJ-8827491", verified: true, name: "BPL Ration Card" },
      { documentType: "caste_cert", documentNumber: "CST-OBC-3329", verified: true, name: "OBC Caste Certificate" }
    ],
    status: "verified"
  },
  {
    _id: "fam_002",
    familyId: "EKP-20260920-0002",
    headOfFamilyName: "Savitaben Solanki",
    address: {
      houseNo: "12, Gram Panchayat Vistar",
      street: "Main Station Road",
      village: "Kalol",
      taluka: "Kalol",
      district: "Gandhinagar",
      state: "Gujarat",
      pincode: "382721"
    },
    rationCardNo: "RC-GUJ-9912043",
    rationCardType: "AAY",
    totalIncome: 72000,
    incomeSource: "Handicrafts & Tailoring",
    category: "SC",
    religion: "Hinduism",
    mobile: "9825012345",
    email: "savitaben.solanki@example.com",
    bankDetails: {
      accountHolderName: "Savitaben Solanki",
      accountNumber: "60199283741029",
      ifscCode: "BKID0002041",
      bankName: "Bank of India",
      branch: "Kalol, Gandhinagar",
      linkedToAadhaar: true
    },
    documents: [
      { documentType: "income_cert", documentNumber: "INC-2025-1102", verified: true, name: "Income Certificate" },
      { documentType: "widow_cert", documentNumber: "WDW-2024-441", verified: true, name: "Widow Certificate" }
    ],
    status: "verified"
  },
  {
    _id: "fam_003",
    familyId: "EKP-20260920-0003",
    headOfFamilyName: "Vikramsinh Vaghela",
    address: {
      houseNo: "Plot 88, Sector 11",
      street: "CH Road",
      village: "Gandhinagar",
      taluka: "Gandhinagar",
      district: "Gandhinagar",
      state: "Gujarat",
      pincode: "382011"
    },
    rationCardNo: "RC-GUJ-1188392",
    rationCardType: "APL",
    totalIncome: 450000,
    incomeSource: "Small Retail Business",
    category: "General",
    religion: "Hinduism",
    mobile: "9426098765",
    email: "vikram.vaghela@example.com",
    bankDetails: {
      accountHolderName: "Vikramsinh Vaghela",
      accountNumber: "20199483720192",
      ifscCode: "HDFC0000123",
      bankName: "HDFC Bank",
      branch: "Sector 11, Gandhinagar",
      linkedToAadhaar: true
    },
    documents: [
      { documentType: "income_cert", documentNumber: "INC-2026-0091", verified: true, name: "Income Certificate" },
      { documentType: "disability_cert", documentNumber: "DIS-2023-772", verified: true, name: "Disability Certificate" }
    ],
    status: "verified"
  }
];

export const MOCK_MEMBERS = [
  // Family 1 Members (Rameshchandra Patel)
  {
    _id: "mem_001",
    familyId: "EKP-20260920-0001",
    name: "Rameshchandra Patel",
    aadhaarNumber: "453289011234",
    aadhaarVerified: true,
    aadhaarVerifiedAt: "2026-01-15T10:30:00.000Z",
    aadhaarVerificationMethod: "mock",
    dob: "1975-06-14",
    gender: "M",
    relationToHOF: "Self",
    maritalStatus: "Married",
    occupation: "Farmer / Daily Wage",
    monthlyIncome: 15000,
    educationRecords: [
      { level: 'Class 10', percentage: 55, yearOfPassing: 1991, boardOrUniversity: 'GSEB' }
    ],
    currentlyEnrolled: false,
    isDisabled: false,
    disabilityPercent: 0,
    isWidow: false,
    isPregnantOrLactating: false,
    isSeniorCitizen: false,
    mobile: "9876543210",
    email: "ramesh.patel@example.com",
    documents: [
      { documentType: "aadhaar_card", verified: true, name: "Aadhaar Card" },
      { documentType: "income_cert", verified: true, name: "Income Certificate" }
    ]
  },
  {
    _id: "mem_002",
    familyId: "EKP-20260920-0001",
    name: "Pooja Patel",
    aadhaarNumber: "889911223344",
    aadhaarVerified: true,
    aadhaarVerifiedAt: "2026-02-10T14:20:00.000Z",
    aadhaarVerificationMethod: "mock",
    dob: "2005-08-20",
    gender: "F",
    relationToHOF: "Daughter",
    maritalStatus: "Single",
    occupation: "Student",
    monthlyIncome: 0,
    educationRecords: [
      { level: 'Class 10', percentage: 88, yearOfPassing: 2020, boardOrUniversity: 'GSEB' },
      { level: 'Class 12', percentage: 82.5, yearOfPassing: 2022, boardOrUniversity: 'GSEB' }
    ],
    currentlyEnrolled: true,
    currentClassOrCourse: "B.Tech Computer Science",
    isDisabled: false,
    disabilityPercent: 0,
    isWidow: false,
    isPregnantOrLactating: false,
    isSeniorCitizen: false,
    mobile: "9876543211",
    email: "pooja.patel@student.edu",
    documents: [
      { documentType: "aadhaar_card", verified: true, name: "Aadhaar Card" },
      { documentType: "mark_sheet", verified: true, name: "12th Standard Marksheet" },
      { documentType: "college_id", verified: true, name: "College ID Card" }
    ]
  },
  {
    _id: "mem_003",
    familyId: "EKP-20260920-0001",
    name: "Manjula Patel",
    aadhaarNumber: "776655443322",
    aadhaarVerified: false,
    aadhaarVerifiedAt: null,
    aadhaarVerificationMethod: "mock",
    dob: "1952-11-03",
    gender: "F",
    relationToHOF: "Mother",
    maritalStatus: "Widow",
    occupation: "Homemaker",
    monthlyIncome: 0,
    educationRecords: [
      { level: 'Class 8', percentage: 50, yearOfPassing: 1968, boardOrUniversity: 'State Board' }
    ],
    currentlyEnrolled: false,
    isDisabled: false,
    disabilityPercent: 0,
    isWidow: true,
    isPregnantOrLactating: false,
    isSeniorCitizen: true,
    mobile: "9876543212",
    email: "",
    documents: [
      { documentType: "aadhaar_card", verified: false, name: "Aadhaar Card" }
    ]
  },

  // Family 2 Members (Savitaben Solanki)
  {
    _id: "mem_004",
    familyId: "EKP-20260920-0002",
    name: "Savitaben Solanki",
    aadhaarNumber: "112233445566",
    aadhaarVerified: true,
    aadhaarVerifiedAt: "2026-01-20T11:15:00.000Z",
    aadhaarVerificationMethod: "mock",
    dob: "1980-04-12",
    gender: "F",
    relationToHOF: "Self",
    maritalStatus: "Widow",
    occupation: "Tailor",
    monthlyIncome: 6000,
    educationLevel: "7th Pass",
    educationPercent: 0,
    currentlyEnrolled: false,
    isDisabled: false,
    disabilityPercent: 0,
    isWidow: true,
    isPregnantOrLactating: false,
    isSeniorCitizen: false,
    mobile: "9825012345",
    email: "savitaben.solanki@example.com",
    documents: [
      { documentType: "aadhaar_card", verified: true, name: "Aadhaar Card" },
      { documentType: "widow_cert", verified: true, name: "Widow Certificate" }
    ]
  },
  {
    _id: "mem_005",
    familyId: "EKP-20260920-0002",
    name: "Karan Solanki",
    aadhaarNumber: "998877665544",
    aadhaarVerified: true,
    aadhaarVerifiedAt: "2026-03-01T09:40:00.000Z",
    aadhaarVerificationMethod: "mock",
    dob: "2007-01-15",
    gender: "M",
    relationToHOF: "Son",
    maritalStatus: "Single",
    occupation: "Student",
    monthlyIncome: 0,
    educationLevel: "12th Science",
    educationPercent: 76.0,
    currentlyEnrolled: true,
    currentClassOrCourse: "12th Standard Science",
    isDisabled: true,
    disabilityPercent: 45,
    disabilityType: "Locomotor Disability",
    isWidow: false,
    isPregnantOrLactating: false,
    isSeniorCitizen: false,
    mobile: "9825012346",
    email: "",
    documents: [
      { documentType: "aadhaar_card", verified: true, name: "Aadhaar Card" },
      { documentType: "disability_cert", verified: true, name: "Disability Certificate (45%)" }
    ]
  },

  // Family 3 Members (Vikramsinh Vaghela)
  {
    _id: "mem_006",
    familyId: "EKP-20260920-0003",
    name: "Vikramsinh Vaghela",
    aadhaarNumber: "334455667788",
    aadhaarVerified: true,
    aadhaarVerifiedAt: "2026-02-05T16:00:00.000Z",
    aadhaarVerificationMethod: "mock",
    dob: "1968-09-30",
    gender: "M",
    relationToHOF: "Self",
    maritalStatus: "Married",
    occupation: "Shop Owner",
    monthlyIncome: 37500,
    educationLevel: "Graduate",
    educationPercent: 62.0,
    currentlyEnrolled: false,
    isDisabled: true,
    disabilityPercent: 50,
    disabilityType: "Visual Impairment",
    isWidow: false,
    isPregnantOrLactating: false,
    isSeniorCitizen: false,
    mobile: "9426098765",
    email: "vikram.vaghela@example.com",
    documents: [
      { documentType: "aadhaar_card", verified: true, name: "Aadhaar Card" },
      { documentType: "disability_cert", verified: true, name: "Disability Certificate (50%)" }
    ]
  },
  {
    _id: "mem_007",
    familyId: "EKP-20260920-0003",
    name: "Geetaben Vaghela",
    aadhaarNumber: "667788990011",
    aadhaarVerified: false,
    aadhaarVerifiedAt: null,
    aadhaarVerificationMethod: "mock",
    dob: "1998-03-25",
    gender: "F",
    relationToHOF: "Daughter-in-law",
    maritalStatus: "Married",
    occupation: "Homemaker",
    monthlyIncome: 0,
    educationLevel: "Graduate",
    educationPercent: 68.0,
    currentlyEnrolled: false,
    isDisabled: false,
    disabilityPercent: 0,
    isWidow: false,
    isPregnantOrLactating: true,
    isSeniorCitizen: false,
    mobile: "9426098766",
    email: "",
    documents: [
      { documentType: "aadhaar_card", verified: false, name: "Aadhaar Card" }
    ]
  }
];

export const MOCK_SCHEMES = [
  {
    _id: "sch_001",
    schemeName: "Mukhyamantri Yuva Swavalamban Yojana (MYSY)",
    schemeCode: "GUJ-MYSY-2026",
    department: "Higher & Technical Education Department",
    description: "Financial scholarship assistance for higher education of bright students belonging to economically weaker sections.",
    benefitType: "Cash",
    benefitAmount: 25000,
    applicationUrl: "https://mysy.guj.nic.in",
    requiredDocuments: ["aadhaar_card", "income_cert", "mark_sheet", "caste_cert"],
    active: true,
    rule: {
      maxIncome: 600000,
      minAge: 16,
      maxAge: 25,
      requiredGender: "Any",
      requiredCategory: ["General", "OBC", "SC", "ST", "SEBC", "EWS"],
      requiresBPL: false,
      requiresWidow: false,
      requiresDisabled: false,
      minDisabilityPercent: 0,
      requiresPregnantOrLactating: false,
      requiredOccupation: "Student",
      minEducationPercent: 60
    }
  },
  {
    _id: "sch_002",
    schemeName: "Ganga Swaroopa Yojana (Vidhwa Sahay)",
    schemeCode: "GUJ-GSY-2026",
    department: "Women and Child Development Department",
    description: "Monthly financial pension support to widowed women to foster financial independence and dignity.",
    benefitType: "Cash",
    benefitAmount: 12500,
    applicationUrl: "https://digitalgujarat.gov.in",
    requiredDocuments: ["aadhaar_card", "income_cert", "widow_cert"],
    active: true,
    rule: {
      maxIncome: 150000,
      minAge: 18,
      maxAge: 75,
      requiredGender: "F",
      requiredCategory: ["General", "OBC", "SC", "ST", "SEBC", "EWS"],
      requiresBPL: false,
      requiresWidow: true,
      requiresDisabled: false,
      minDisabilityPercent: 0,
      requiresPregnantOrLactating: false,
      requiredOccupation: "",
      minEducationPercent: 0
    }
  },
  {
    _id: "sch_003",
    schemeName: "Divyang Swavalamban Yojana",
    schemeCode: "GUJ-DSY-2026",
    department: "Social Justice and Empowerment Department",
    description: "Financial assistance and assistive equipment subsidy for persons with physical disabilities.",
    benefitType: "Subsidy",
    benefitAmount: 20000,
    applicationUrl: "https://sjebd.gujarat.gov.in",
    requiredDocuments: ["aadhaar_card", "disability_cert", "income_cert"],
    active: true,
    rule: {
      maxIncome: 500000,
      minAge: 5,
      maxAge: 70,
      requiredGender: "Any",
      requiredCategory: ["General", "OBC", "SC", "ST", "SEBC", "EWS"],
      requiresBPL: false,
      requiresWidow: false,
      requiresDisabled: true,
      minDisabilityPercent: 40,
      requiresPregnantOrLactating: false,
      requiredOccupation: "",
      minEducationPercent: 0
    }
  },
  {
    _id: "sch_004",
    schemeName: "Vayoshreshtha Senior Citizen Support Scheme",
    schemeCode: "GUJ-VSC-2026",
    department: "Social Justice and Empowerment Department",
    description: "Monthly old age pension support and healthcare allowance for senior citizens in BPL households.",
    benefitType: "Cash",
    benefitAmount: 15000,
    applicationUrl: "https://socialsecurity.gujarat.gov.in",
    requiredDocuments: ["aadhaar_card", "ration_card", "income_cert"],
    active: true,
    rule: {
      maxIncome: 200000,
      minAge: 60,
      maxAge: 120,
      requiredGender: "Any",
      requiredCategory: ["General", "OBC", "SC", "ST", "SEBC", "EWS"],
      requiresBPL: true,
      requiresWidow: false,
      requiresDisabled: false,
      minDisabilityPercent: 0,
      requiresPregnantOrLactating: false,
      requiredOccupation: "",
      minEducationPercent: 0
    }
  },
  {
    _id: "sch_005",
    schemeName: "Kasturba Poshan Sahay Yojana",
    schemeCode: "GUJ-KPSY-2026",
    department: "Health and Family Welfare Department",
    description: "Financial nutritional support to pregnant and lactating mothers for health maintenance.",
    benefitType: "Cash",
    benefitAmount: 6000,
    applicationUrl: "https://health.gujarat.gov.in",
    requiredDocuments: ["aadhaar_card", "mcp_card"],
    active: true,
    rule: {
      maxIncome: 300000,
      minAge: 18,
      maxAge: 45,
      requiredGender: "F",
      requiredCategory: ["General", "OBC", "SC", "ST", "SEBC", "EWS"],
      requiresBPL: false,
      requiresWidow: false,
      requiresDisabled: false,
      minDisabilityPercent: 0,
      requiresPregnantOrLactating: true,
      requiredOccupation: "",
      minEducationPercent: 0
    }
  }
];

export const MOCK_ENROLLMENTS = [
  {
    _id: "enr_001",
    memberId: "mem_002",
    memberName: "Pooja Patel",
    familyId: "EKP-20260920-0001",
    schemeId: "sch_001",
    schemeName: "Mukhyamantri Yuva Swavalamban Yojana (MYSY)",
    department: "Higher & Technical Education Department",
    benefitType: "Cash",
    benefitAmount: 25000,
    enrolledOn: "2026-02-15",
    status: "active",
    benefitPaid: true
  },
  {
    _id: "enr_002",
    memberId: "mem_004",
    memberName: "Savitaben Solanki",
    familyId: "EKP-20260920-0002",
    schemeId: "sch_002",
    schemeName: "Ganga Swaroopa Yojana (Vidhwa Sahay)",
    department: "Women and Child Development Department",
    benefitType: "Cash",
    benefitAmount: 12500,
    enrolledOn: "2026-01-28",
    status: "active",
    benefitPaid: true
  },
  {
    _id: "enr_003",
    memberId: "mem_004",
    memberName: "Savitaben Solanki",
    familyId: "EKP-20260920-0002",
    schemeId: "sch_002_dup",
    schemeName: "Nari Sahay Widowed Pension Scheme B",
    department: "Women and Child Development Department",
    benefitType: "Cash",
    benefitAmount: 10000,
    enrolledOn: "2026-03-05",
    status: "flagged_duplicate",
    flaggedReason: "Conflicting active pension benefit under same department (Women and Child Development Department)",
    benefitPaid: false
  }
];

export const MOCK_AUDIT_LOGS = [
  {
    _id: "aud_001",
    actorType: "Member",
    actorName: "Rameshchandra Patel",
    action: "created_family",
    targetType: "Family",
    targetId: "EKP-20260920-0001",
    timestamp: "2026-01-15T10:00:00Z",
    details: { message: "Created family unit with 3 members." }
  },
  {
    _id: "aud_002",
    actorType: "Member",
    actorName: "Pooja Patel",
    action: "verified_aadhaar",
    targetType: "Member",
    targetId: "mem_002",
    timestamp: "2026-02-10T14:20:00Z",
    details: { method: "mock", status: "Verified" }
  },
  {
    _id: "aud_003",
    actorType: "Officer",
    actorName: "Officer Sharma (EMP-8832)",
    action: "created_scheme",
    targetType: "Scheme",
    targetId: "sch_001",
    timestamp: "2026-02-12T09:15:00Z",
    details: { schemeCode: "GUJ-MYSY-2026", matchedCount: 1 }
  },
  {
    _id: "aud_004",
    actorType: "Officer",
    actorName: "System Automation",
    action: "flagged_duplicate",
    targetType: "Enrollment",
    targetId: "enr_003",
    timestamp: "2026-03-05T11:45:00Z",
    details: { member: "Savitaben Solanki", department: "Women and Child Development Department", existingScheme: "Ganga Swaroopa Yojana" }
  }
];
