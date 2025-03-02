const express = require("express");
const { createClient } = require("redis");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
const multer = require("multer");
const fs = require("fs");
const Papa = require('papaparse');
require('dotenv').config();

// Multer for file upload (store in memory)
const upload = multer({ storage: multer.memoryStorage() });

app.use(express.json());
app.use(cors());

const client = createClient();
client.connect().catch(console.error);

client.on("error", (err) => console.error("Redis Client Error", err));


// Handle CSV Uploads
app.post('/uploads', upload.single('csvFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const csvData = req.file.buffer.toString();
    
    // Parsing CSV with trimming for 'yearLevel'
    const parsedData = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true,
      delimiter: ',',
      transform: (value, field) => field === 'yearLevel' ? value.trim() : value,  // Trim 'yearLevel' specifically
    });

    // Debugging
    console.log('📊 Parsed CSV Data:', parsedData.data);  // Log parsed data
    console.log('Year Level Field:', parsedData.data.map(student => student.yearLevel)); // Log yearLevel field specifically
    console.log('Parsed CSV Headers:', Object.keys(parsedData.data[0])); // Log headers

    const students = parsedData.data.filter(student => student.id); // Ensure valid records

    // Loop through students and normalize data
    for (const student of students) {
      // Normalize yearLevel and college
      const normalizedStudent = {
        id: student.id,
        name: student.name || 'Unknown',
        email: student.email || 'No Email',
        age: student.age || 'N/A',
        phone: student.phone || 'No Phone',
        course: student.course || 'Unknown',
        address: student.address || 'No Address',
        yearLevel: student.yearLevel && student.yearLevel.trim() !== '' ? student.yearLevel : 'Unknown',  // Ensure 'yearLevel' is trimmed and valid
        college: student.college ? student.college : 'Unknown',  // Ensure 'college' is handled
      };

      const key = `student:${normalizedStudent.id}`;

      console.log('🔍 Saving to Redis:', key, normalizedStudent);  // Log normalized data

      // Save normalized student data to Redis
      for (const [field, value] of Object.entries(normalizedStudent)) {
        await client.hSet(key, field, value);
      }
    }

    res.status(200).json({ message: 'CSV uploaded successfully', students });
  } catch (error) {
    console.error('❌ CSV upload error:', error);
    res.status(500).json({ message: 'Error processing CSV', error });
  }
});

// Add Student
app.post('/students', async (req, res) => {
  const { id, name, email, age, phone, course, address, yearLevel, college } = req.body;

  if (!id || !name) {
    return res.status(400).json({ message: 'ID and Name are required' });
  }

  try {
    const key = `student:${id}`;

    await client.hSet(key, "name", name || "");
    await client.hSet(key, "email", email || "");
    await client.hSet(key, "age", age || "");
    await client.hSet(key, "phone", phone || "");
    await client.hSet(key, "course", course || "");
    await client.hSet(key, "address", address || "");
    await client.hSet(key, "yearLevel", yearLevel || "");
    await client.hSet(key, "college", college || "");

    res.status(201).json({ message: 'Student saved successfully' });
  } catch (error) {
    console.error('Error saving student:', error);
    res.status(500).json({ message: 'Failed to save student' });
  }
});


// Get All Students
app.get('/students', async (req, res) => {
  try {
    const keys = await client.keys('student:*');
    const students = await Promise.all(keys.map(async (key) => {
      const studentData = await client.hGetAll(key);
      return { id: key.split(':')[1], ...studentData };
    }));

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// Update Student
app.put("/students/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, age, phone, course, address, yearLevel, college } = req.body;
        const key = `student:${id}`;
        
        await client.hSet(key, "name", name || "");
        await client.hSet(key, "email", email || "");
        await client.hSet(key, "age", age || "");
        await client.hSet(key, "phone", phone || "");
        await client.hSet(key, "course", course || "");
        await client.hSet(key, "address", address || "");
        await client.hSet(key, "yearLevel", yearLevel || "");
        await client.hSet(key, "college", college || "");
        
        res.json({ message: "Student updated successfully" });
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Delete Student
app.delete("/students/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await client.del(`student:${id}`);
        res.json({ message: "Student deleted successfully" });
    } catch (error) {
        console.error("Error deleting student:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
