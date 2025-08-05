const bcrypt = require('bcryptjs');
const User = require('./models/User');
const sequelize = require('./config/database');
require('dotenv').config();

async function createCustomAdminAccount() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Get command line arguments
    const args = process.argv.slice(2);
    const adminEmail = args[0] || 'admin@kramzfitness.com';
    const adminPassword = args[1] || 'admin123';

    console.log('Creating admin account with:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (existingAdmin) {
      console.log('Admin account already exists!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);
      console.log('Email verified:', existingAdmin.email_verified);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = await User.create({
      email: adminEmail,
      password: hashedPassword,
      role: 'admin',
      email_verified: true, // Admin accounts are pre-verified
      status: 'active'
    });

    console.log('✅ Admin account created successfully!');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('Role:', admin.role);
    console.log('User ID:', admin.user_id);

    console.log('\n📧 Login Credentials:');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    console.log('\n🔗 You can now login at: http://localhost:3000/login');

  } catch (error) {
    console.error('❌ Error creating admin account:', error);
  } finally {
    await sequelize.close();
  }
}

createCustomAdminAccount(); 