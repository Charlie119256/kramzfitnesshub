-- Create database if not exists and use it
CREATE DATABASE IF NOT EXISTS kramzfitnesshub;
USE kramzfitnesshub;

START TRANSACTION;

-- USERS TABLE (all users: member, clerk, admin)
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('member', 'clerk', 'admin') NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verification_token_expires DATETIME,
    reset_token VARCHAR(255),
    reset_token_expires DATETIME,
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- MEMBERS TABLE
CREATE TABLE members (
    member_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    member_code VARCHAR(20) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    suffix VARCHAR(20),
    dob DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    barangay VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    profile_picture VARCHAR(255) DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    qr_code_path VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- CLERKS TABLE
CREATE TABLE clerks (
    clerk_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    suffix VARCHAR(20),
    dob DATE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    barangay VARCHAR(100) NOT NULL,
    municipality VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- MEMBERSHIP TYPES TABLE
CREATE TABLE membership_types (
    membership_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    duration_days INT NOT NULL,
    description VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PLAN APPLICATIONS TABLE
CREATE TABLE plan_applications (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    membership_id INT NOT NULL,
    status ENUM('pending', 'accepted', 'declined', 'expired') DEFAULT 'pending',
    preferred_start_date DATE NOT NULL,
    payment_amount DECIMAL(10,2),
    payment_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (membership_id) REFERENCES membership_types(membership_id)
);

-- MEMBER MEMBERSHIPS TABLE (active/expired plans)
CREATE TABLE member_memberships (
    member_membership_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    membership_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    plan_status ENUM('pending', 'active', 'expired') DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (membership_id) REFERENCES membership_types(membership_id)
);

-- PAYMENTS TABLE
CREATE TABLE payments (
    payment_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    membership_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATETIME NOT NULL,
    payment_method ENUM('cash', 'gcash') NOT NULL,
    reference_number VARCHAR(100),
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (membership_id) REFERENCES membership_types(membership_id)
);

-- RECEIPTS TABLE
CREATE TABLE receipts (
    receipt_id INT AUTO_INCREMENT PRIMARY KEY,
    member_membership_id INT NOT NULL,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'gcash') NOT NULL,
    reference_number VARCHAR(100),
    receipt_url VARCHAR(255),
    details TEXT,
    FOREIGN KEY (member_membership_id) REFERENCES member_memberships(member_membership_id)
);

-- ATTENDANCE TABLE
CREATE TABLE attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    membership_id INT,
    date DATE NOT NULL,
    time_in DATETIME NOT NULL,
    time_out DATETIME,
    status ENUM('present', 'invalid', 'expired') DEFAULT 'present',
    remarks VARCHAR(255),
    FOREIGN KEY (member_id) REFERENCES members(member_id),
    FOREIGN KEY (membership_id) REFERENCES membership_types(membership_id)
);

-- EQUIPMENT CATEGORIES TABLE
CREATE TABLE equipment_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- EQUIPMENT TABLE
CREATE TABLE equipment (
    equipment_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    category_id INT,
    quantity INT NOT NULL,
    `condition` VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    purchase_date DATE NOT NULL,
    status ENUM('available', 'under_maintenance') DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES equipment_categories(category_id)
);

-- ANNOUNCEMENTS TABLE
CREATE TABLE announcements (
    announcement_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    target_audience ENUM('all', 'members', 'clerks') NOT NULL,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- NOTIFICATIONS TABLE
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type ENUM('membership_expiry', 'announcement', 'other') NOT NULL,
    title VARCHAR(255),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- BMI RECORDS TABLE
CREATE TABLE bmi_records (
    bmi_id INT AUTO_INCREMENT PRIMARY KEY,
    member_id INT NOT NULL,
    height_cm DECIMAL(5,2) NOT NULL,
    weight_kg DECIMAL(5,2) NOT NULL,
    bmi_value DECIMAL(5,2) NOT NULL,
    recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes VARCHAR(255),
    FOREIGN KEY (member_id) REFERENCES members(member_id)
);

-- WORKOUT CATEGORIES TABLE
CREATE TABLE workout_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);

-- WORKOUTS TABLE
CREATE TABLE workouts (
    workout_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    FOREIGN KEY (category_id) REFERENCES workout_categories(category_id)
);

-- WEEK PLANS TABLE
CREATE TABLE week_plans (
    week_plan_id INT AUTO_INCREMENT PRIMARY KEY,
    workout_id INT NOT NULL,
    week_number INT NOT NULL,
    description VARCHAR(255),
    FOREIGN KEY (workout_id) REFERENCES workouts(workout_id)
);

-- EXERCISES TABLE
CREATE TABLE exercises (
    exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    week_plan_id INT NOT NULL,
    day VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    sets INT,
    reps_time VARCHAR(50),
    rest_time VARCHAR(50),
    description VARCHAR(255),
    FOREIGN KEY (week_plan_id) REFERENCES week_plans(week_plan_id)
);

COMMIT;
