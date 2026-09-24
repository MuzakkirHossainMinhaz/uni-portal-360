// One-time migration. Default: read-only inventory. Use --apply for deletion.
const path = require('node:path');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');

dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true });
const retired = ['member', 'registrar'];
const kept = ['superAdmin', 'admin', 'faculty', 'student'];
const retiredPermissions = ['createMember', 'deleteMember', 'updateMember', 'getMember'];
const apply = process.argv.includes('--apply');

async function inspect(db, session) {
  const options = session ? { session } : {};
  const users = await db.collection('users').find({ role: { $in: retired } }, options).toArray();
  const roles = await db.collection('roles').find({ name: { $in: retired } }, options).toArray();
  const permissions = await db.collection('permissions').find({ name: { $in: retiredPermissions } }, options).toArray();
  const roleIds = roles.map(row => row._id);
  const permissionIds = permissions.map(row => row._id);
  const userIds = users.map(row => row._id);
  const mappingFilter = { $or: [{ roleId: { $in: roleIds } }, { permissionId: { $in: permissionIds } }] };
  const notificationFilter = { userId: { $in: userIds } };
  const counts = {};
  for (const [name, filter] of [
    ['users', { role: { $in: retired } }], ['members', {}], ['registrars', {}],
    ['roles', { name: { $in: retired } }], ['permissions', { name: { $in: retiredPermissions } }],
    ['rolepermissions', mappingFilter], ['notifications', notificationFilter],
  ]) counts[name] = await db.collection(name).countDocuments(filter, options);
  return { users, userIds, roleIds, permissionIds, mappingFilter, notificationFilter, counts };
}

async function retainedSnapshot(db, session) {
  const options = session ? { session } : {};
  const roles = await db.collection('roles').find({ name: { $in: kept } }, options).sort({ _id: 1 }).toArray();
  const removedPermissions = await db.collection('permissions').find({ name: { $in: retiredPermissions } }, options).toArray();
  const data = {};
  for (const [name, filter] of [
    ['users', { role: { $nin: retired } }],
    ['roles', { name: { $nin: retired } }],
    ['permissions', { name: { $nin: retiredPermissions } }],
    ['rolepermissions', { roleId: { $in: roles.map(row => row._id) }, permissionId: { $nin: removedPermissions.map(row => row._id) } }],
    ['admins', {}], ['faculties', {}], ['students', {}],
  ]) {
    const rows = await db.collection(name).find(filter, options).sort({ _id: 1 }).toArray();
    data[name] = { count: rows.length, hash: createHash('sha256').update(JSON.stringify(rows)).digest('hex') };
  }
  return data;
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not configured');
  const client = new MongoClient(process.env.DATABASE_URL, { serverSelectionTimeoutMS: 15000 });
  try {
    await client.connect();
    const db = client.db();
    const inventory = await inspect(db);
    const roleCounts = await db.collection('users').aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]).toArray();
    console.log(JSON.stringify({ mode: apply ? 'apply' : 'inspect', database: db.databaseName, targets: inventory.counts, accountRoleCounts: roleCounts }, null, 2));
    if (!apply) return;
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        const target = await inspect(db, session);
        const before = await retainedSnapshot(db, session);
        // Abort rather than damage a core-role profile linked to a retired account.
        for (const name of ['admins', 'faculties', 'students']) {
          assert.equal(await db.collection(name).countDocuments({ user: { $in: target.userIds } }, { session }), 0, 'A retired account has a core-role profile; manual migration is required');
        }
        for (const name of ['members', 'registrars']) {
          const profiles = await db.collection(name).find({}, { session, projection: { user: 1 } }).toArray();
          const linkedIds = profiles.map(row => row.user).filter(Boolean);
          assert.equal(await db.collection('users').countDocuments({ _id: { $in: linkedIds }, role: { $nin: retired } }, { session }), 0, 'A retired profile references a retained user; manual migration is required');
        }
        for (const [name, filter] of [
          ['rolepermissions', target.mappingFilter],
          ['notifications', target.notificationFilter],
          ['members', {}], ['registrars', {}],
          ['users', { role: { $in: retired } }],
          ['roles', { name: { $in: retired } }],
          ['permissions', { name: { $in: retiredPermissions } }],
        ]) await db.collection(name).deleteMany(filter, { session });
        assert.deepEqual(await retainedSnapshot(db, session), before, 'Retained roles, accounts, profiles or permissions changed');
        assert.equal(await db.collection('rolepermissions').countDocuments(target.mappingFilter, { session }), 0, 'Retired permission mappings remain');
        assert.equal(await db.collection('notifications').countDocuments(target.notificationFilter, { session }), 0, 'Retired account notifications remain');
        const after = await inspect(db, session);
        assert.ok(Object.values(after.counts).every(count => count === 0), 'Retired records remain');
      });
    } finally { await session.endSession(); }
    const remainingRoles = await db.collection('roles').distinct('name');
    console.log(JSON.stringify({ verifiedRemaining: (await inspect(db)).counts, remainingRoles, retainedData: 'unchanged' }, null, 2));
  } finally { await client.close(); }
}

main().catch(error => {
  // Avoid printing connection strings or account records from driver errors.
  console.error(`Migration failed (${error.name}). No connection credentials are logged.`);
  if (error.code) console.error(`Error code: ${error.code}`);
  if (error.name === 'AssertionError') console.error(error.message);
  process.exitCode = 1;
});
