import { PrismaClient, UserRole } from '../src/generated/prisma';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const INDIAN_STATES = [
  { name: 'Andhra Pradesh', code: 'AP' },
  { name: 'Arunachal Pradesh', code: 'AR' },
  { name: 'Assam', code: 'AS' },
  { name: 'Bihar', code: 'BR' },
  { name: 'Chhattisgarh', code: 'CG' },
  { name: 'Goa', code: 'GA' },
  { name: 'Gujarat', code: 'GJ' },
  { name: 'Haryana', code: 'HR' },
  { name: 'Himachal Pradesh', code: 'HP' },
  { name: 'Jharkhand', code: 'JH' },
  { name: 'Karnataka', code: 'KA' },
  { name: 'Kerala', code: 'KL' },
  { name: 'Madhya Pradesh', code: 'MP' },
  { name: 'Maharashtra', code: 'MH' },
  { name: 'Manipur', code: 'MN' },
  { name: 'Meghalaya', code: 'ML' },
  { name: 'Mizoram', code: 'MZ' },
  { name: 'Nagaland', code: 'NL' },
  { name: 'Odisha', code: 'OD' },
  { name: 'Punjab', code: 'PB' },
  { name: 'Rajasthan', code: 'RJ' },
  { name: 'Sikkim', code: 'SK' },
  { name: 'Tamil Nadu', code: 'TN' },
  { name: 'Telangana', code: 'TS' },
  { name: 'Tripura', code: 'TR' },
  { name: 'Uttar Pradesh', code: 'UP' },
  { name: 'Uttarakhand', code: 'UK' },
  { name: 'West Bengal', code: 'WB' },
];

const MAJOR_CITIES: Record<string, string[]> = {
  AP: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Tirupati'],
  AR: ['Itanagar', 'Tawang', 'Pasighat'],
  AS: ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat'],
  BR: ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur'],
  CG: ['Raipur', 'Bhilai', 'Bilaspur'],
  GA: ['Panaji', 'Vasco da Gama', 'Mapusa'],
  GJ: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar'],
  HR: ['Gurugram', 'Faridabad', 'Panipat', 'Ambala'],
  HP: ['Shimla', 'Manali', 'Dharamsala'],
  JH: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro'],
  KA: ['Bengaluru', 'Mysuru', 'Hubli-Dharwad', 'Mangaluru', 'Belgaum'],
  KL: ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
  MP: ['Bhopal', 'Indore', 'Gwalior', 'Jabalpur', 'Ujjain'],
  MH: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad'],
  MN: ['Imphal'],
  ML: ['Shillong', 'Tura'],
  MZ: ['Aizawl'],
  NL: ['Kohima', 'Dimapur'],
  OD: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur'],
  PB: ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
  RJ: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  SK: ['Gangtok'],
  TN: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
  TS: ['Hyderabad', 'Warangal', 'Karimnagar', 'Nizamabad'],
  TR: ['Agartala'],
  UP: ['Lucknow', 'Noida', 'Ghaziabad', 'Agra', 'Varanasi', 'Kanpur'],
  UK: ['Dehradun', 'Haridwar', 'Haldwani'],
  WB: ['Kolkata', 'Howrah', 'Durgapur', 'Siliguri', 'Asansol'],
};

const PROPERTY_TYPES = [
  'Office', 'Retail', 'Warehouse', 'Industrial', 'Residential',
  'CoWorking', 'Plot', 'Farmhouse',
];

const FURNISHING_STATUSES = [
  'Unfurnished', 'Semi Furnished', 'Fully Furnished', 'Warm Shell', 'Bare Shell',
];

const AVAILABILITY_STATUSES = [
  'Available', 'Occupied', 'Under Maintenance', 'Coming Soon',
  'Not Available', 'Reserved',
];

const VERIFICATION_STATUSES = [
  'Unverified', 'Under Review', 'Verified', 'Discrepancy Found',
];

const CONTACT_ROLES = [
  'Owner', 'Landlord', 'Tenant', 'Manager', 'Agent',
  'Facility Manager', 'Security', 'Maintenance', 'Legal', 'Accountant',
];

const DOCUMENT_CATEGORIES = [
  'Lease Agreement', 'NOC Certificate', 'Sale Deed', 'Tax Receipt',
  'Occupancy Certificate', 'Building Plan', 'Insurance', 'Photograph',
  'ID Proof', 'Other',
];

const SOURCES = [
  'Manual Entry', 'Website', 'Referral', '99acres', 'MagicBricks',
  'Housing.com', 'JustDial', 'Google Maps', 'Walk-in', 'Existing Client',
];

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Admin User ────────────────────────────────────────
  const adminPasswordHash = await argon2.hash('Admin@123');
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@ired.com' },
    update: {},
    create: {
      fullName: 'System Admin',
      email: 'admin@ired.com',
      mobileNumber: '9999999999',
      passwordHash: adminPasswordHash,
      role: UserRole.ADMIN,
      emailVerifiedAt: new Date(),
      mobileVerifiedAt: new Date(),
    },
  });
  console.log(`  ✅ Admin user: ${adminUser.email}`);

  // ─── States ────────────────────────────────────────────
  const stateMap = new Map<string, string>();
  for (const state of INDIAN_STATES) {
    const record = await prisma.state.upsert({
      where: { code: state.code },
      update: {},
      create: { name: state.name, code: state.code },
    });
    stateMap.set(state.code, record.id);
  }
  console.log(`  ✅ ${INDIAN_STATES.length} states`);

  // ─── Cities ────────────────────────────────────────────
  let cityCount = 0;
  for (const [stateCode, cities] of Object.entries(MAJOR_CITIES)) {
    const stateId = stateMap.get(stateCode);
    if (!stateId) continue;

    for (const cityName of cities) {
      const existing = await prisma.city.findFirst({
        where: { name: cityName, stateId },
      });
      if (!existing) {
        await prisma.city.create({
          data: { name: cityName, stateId },
        });
      }
      cityCount++;
    }
  }
  console.log(`  ✅ ${cityCount} cities`);

  // ─── Reference Data ────────────────────────────────────
  const upsertMany = async <T extends { name: string }>(
    model: any,
    items: T[],
  ) => {
    for (const item of items) {
      await model.upsert({
        where: { name: item.name || item },
        update: {},
        create: item,
      });
    }
  };

  await upsertMany(prisma.propertyType, PROPERTY_TYPES.map((name) => ({ name })));
  console.log(`  ✅ ${PROPERTY_TYPES.length} property types`);

  await upsertMany(prisma.furnishingStatus, FURNISHING_STATUSES.map((name) => ({ name })));
  console.log(`  ✅ ${FURNISHING_STATUSES.length} furnishing statuses`);

  await upsertMany(prisma.availabilityStatus, AVAILABILITY_STATUSES.map((name) => ({ name })));
  console.log(`  ✅ ${AVAILABILITY_STATUSES.length} availability statuses`);

  await upsertMany(prisma.verificationStatus, VERIFICATION_STATUSES.map((name) => ({ name })));
  console.log(`  ✅ ${VERIFICATION_STATUSES.length} verification statuses`);

  await upsertMany(prisma.contactRole, CONTACT_ROLES.map((name) => ({ name })));
  console.log(`  ✅ ${CONTACT_ROLES.length} contact roles`);

  await upsertMany(prisma.documentCategory, DOCUMENT_CATEGORIES.map((name) => ({ name })));
  console.log(`  ✅ ${DOCUMENT_CATEGORIES.length} document categories`);

  await upsertMany(prisma.source, SOURCES.map((name) => ({ name })));
  console.log(`  ✅ ${SOURCES.length} sources`);

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
