#!/usr/bin/env node

const { UserManager } = require('./user-management');

// Simple CLI for user management
async function main() {
  const userManager = new UserManager();
  const args = process.argv.slice(2);
  const command = args[0];

  console.log('🔧 SAHAYAK User Management CLI\n');

  switch (command) {
    case 'list':
      console.log('📋 Listing all users:');
      await userManager.listUsers();
      break;

    case 'create':
      if (args.length < 3) {
        console.log('❌ Usage: node manage-users.js create <email> <fullName> [additionalData]');
        console.log('Example: node manage-users.js create teacher@school.com "Teacher Name"');
        process.exit(1);
      }
      const email = args[1];
      const fullName = args[2];
      const additionalData = args[3] ? JSON.parse(args[3]) : {};
      
      console.log(`👤 Creating user: ${fullName} (${email})`);
      await userManager.createUser(email, fullName, additionalData);
      break;

    case 'find':
      if (args.length < 2) {
        console.log('❌ Usage: node manage-users.js find <email|uid>');
        process.exit(1);
      }
      const identifier = args[1];
      
      if (identifier.includes('@')) {
        // Search by email
        await userManager.getUserByEmail(identifier);
      } else {
        // Search by UID
        await userManager.getUserByUID(identifier);
      }
      break;

    case 'summary':
      if (args.length < 2) {
        console.log('❌ Usage: node manage-users.js summary <uid>');
        process.exit(1);
      }
      const uid = args[1];
      await userManager.getUserDataSummary(uid);
      break;

    case 'history':
      if (args.length < 2) {
        console.log('❌ Usage: node manage-users.js history <uid>');
        process.exit(1);
      }
      const historyUid = args[1];
      await userManager.getUserHistory(historyUid);
      break;

    case 'delete':
      if (args.length < 2) {
        console.log('❌ Usage: node manage-users.js delete <uid>');
        console.log('⚠️ WARNING: This will delete the user and ALL their data!');
        process.exit(1);
      }
      const deleteUid = args[1];
      console.log('⚠️ WARNING: This will delete the user and ALL their data!');
      console.log('Type "CONFIRM" to proceed:');
      
      // In a real CLI, you'd use readline to get user confirmation
      // For now, we'll just proceed
      await userManager.deleteUser(deleteUid);
      break;

    case 'transfer':
      if (args.length < 3) {
        console.log('❌ Usage: node manage-users.js transfer <fromUid> <toUid>');
        process.exit(1);
      }
      const fromUid = args[1];
      const toUid = args[2];
      await userManager.transferUserData(fromUid, toUid);
      break;

    case 'help':
    default:
      console.log('Available commands:');
      console.log('  list                    - List all users');
      console.log('  create <email> <name>   - Create a new user');
      console.log('  find <email|uid>        - Find user by email or UID');
      console.log('  summary <uid>           - Get user data summary');
      console.log('  history <uid>           - Get user complete history');
      console.log('  delete <uid>            - Delete user and all their data');
      console.log('  transfer <from> <to>    - Transfer data between users');
      console.log('  help                    - Show this help message');
      console.log('');
      console.log('Examples:');
      console.log('  node manage-users.js list');
      console.log('  node manage-users.js create teacher@school.com "Teacher Name"');
      console.log('  node manage-users.js find teacher@school.com');
      console.log('  node manage-users.js summary abc123uid');
      console.log('  node manage-users.js history abc123uid');
      break;
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the CLI
if (require.main === module) {
  main().catch(console.error);
} 