import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Modal, Button, Form, Table } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Papa from 'papaparse';
import VisualizationSection from './VisualizationSection';
import { useNavigate } from 'react-router-dom';
import '../App.css';
const API_URL = "http://localhost:5000/upload-csv"; // Adjust API URL


  const Admin = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCategory, setSearchCategory] = useState('name');
    const [chartCategory, setChartCategory] = useState('course');
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
  
    const defaultFormData = { 
      id: '', name: '', email: '', age: '', phone: '', course: '', 
      address: '', yearLevel: '', college: '' 
    };
    
    
    const [formData, setFormData] = useState(defaultFormData);
  
    useEffect(() => {
      fetchStudents();
    }, []);
  
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const response = await axios.get('http://localhost:5000/students');
    
        // Sort students by ID in ascending order based on numeric values
        const sortedStudents = response.data.sort((a, b) => {
          const numA = a.id.match(/\d+/g)?.map(Number) || [];
          const numB = b.id.match(/\d+/g)?.map(Number) || [];
    
          // Compare year first, then the numeric part
          return numA[0] - numB[0] || numA[1] - numB[1];
        });
    
        setStudents(sortedStudents);
      } catch (error) {
        toast.error('Error fetching students');
      }
      setLoading(false);
    };
    
    
  
    const handleInputChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    };
  
    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) {
          toast.error('Please select a CSV file first');
          return;
      }
  
      console.log("📤 Reading CSV file:", file.name);
  
      const formData = new FormData();
      formData.append('csvFile', file); // Backend expects 'csvFile' as the field name
  
      try {
          console.log("📤 Uploading CSV file:", file.name);
  
          // Send the file to the backend
          const response = await axios.post('http://localhost:5000/uploads', formData, {
              headers: { 'Content-Type': 'multipart/form-data' },
          });
  
          console.log("✅ Upload response:", response.data);
  
          if (response.data.message === "CSV uploaded successfully") {
              toast.success('CSV uploaded successfully!');
          } else {
              toast.warn('Upload succeeded, but check data integrity.');
          }
  
          // Refresh student data and statistics
          await fetchStudents();
                
  
      } catch (error) {
          console.error('❌ Error uploading CSV:', error.response?.data || error);
  
          // Handle errors properly
          if (error.response) {
              toast.error(`Upload failed: ${error.response.data.message || 'Unknown server error'}`);
          } else {
              toast.error('Server unreachable. Check connection.');
          }
      }
  };
  
    
  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user session
    window.location.href = "/"; // Force redirect to login page
  };
      
      
  
    const handleAddOrEditStudent = async () => {
      const { status, ...trimmedFormData } = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [key, value?.toString().trim() || ""])
      );
    
      if (!trimmedFormData.id || !trimmedFormData.name) {
        toast.error("ID and Name are required!");
        return;
      }
    
      try {
        if (editingStudent) {
          if (editingStudent.id !== trimmedFormData.id) {
            // If ID was changed, delete the old record and create a new one
            await axios.delete(`http://localhost:5000/students/${editingStudent.id}`);
            await axios.post("http://localhost:5000/students", trimmedFormData);
          } else {
            // Just update the existing record if ID didn't change
            await axios.put(`http://localhost:5000/students/${editingStudent.id}`, trimmedFormData);
          }
          toast.success("Student updated successfully");
        } else {
          const existingStudent = students.find((s) => s.id === trimmedFormData.id);
          if (existingStudent) {
            toast.error("Student ID already exists!");
            return;
          }
          await axios.post("http://localhost:5000/students", trimmedFormData);
          toast.success("Student added successfully");
        }
    
        await fetchStudents(); // Refresh the list
        closeStudentModal(); // Close modal and reset form
    
      } catch (error) {
        console.error("Error saving student:", error);
        toast.error(error.response?.data?.message || "Error saving student");
      }
    };
    
    
  
    const handleEditStudent = (student) => {
      setEditingStudent(student);
      setFormData({ ...student }); // Preserve ID
      setShowModal(true);
    };
    
    const handleDeleteStudent = async (id) => {
      try {
        await axios.delete(`http://localhost:5000/students/${id}`);
        toast.success('Student deleted successfully');
        fetchStudents();
      } catch (error) {
        toast.error('Error deleting student');
      }
    };
  
    const closeStudentModal = () => {
      setShowModal(false);
      setEditingStudent(null);
      setFormData(defaultFormData);
    };
  
    const filteredStudents = students.filter(student => {
      const value = student[searchCategory]?.toString().toLowerCase() || '';
      return value.includes(searchQuery.toLowerCase());
    });
  
    return (
      <div className="container mt-5">
          <div className="header">
  <h2>Student Management System</h2>
  
</div>

{/* Logout Button */}
<div className="d-flex justify-content-end mb-3">
        <Button variant="outline-danger" onClick={handleLogout}>
          Logout
        </Button>
      </div>

  
<div className="search-container">

          <Form.Select value={searchCategory} onChange={(e) => setSearchCategory(e.target.value)}>
            {Object.keys(defaultFormData).map(attr => <option key={attr} value={attr}>{attr}</option>)}
          </Form.Select>
          <input type="text" className="form-control" placeholder={`Search by ${searchCategory}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        
        <Button className="mb-3" onClick={() => { 

    setEditingStudent(null);  // ✅ Reset editingStudent
    setFormData(defaultFormData);  // ✅ Reset form fields
    setShowModal(true);  // ✅ Open modal
  }}>
    Add Student
  </Button>
  
  <div className="text-center">
  <input type="file" accept=".csv" onChange={handleFileUpload} />
</div>

        
        <Table striped bordered hover className="table">

    <thead>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Email</th>
        <th>Age</th>
        <th>Phone</th>
        <th>Course</th>
        <th>Address</th>  {/* ✅ Added Address */}
        <th>Year Level</th>  {/* ✅ Added Year Level */}
        <th>College</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {filteredStudents.map(student => (
        <tr key={student.id}>
          <td>{student.id}</td>
          <td>{student.name}</td>
          <td>{student.email}</td>
          <td>{student.age}</td>
          <td>{student.phone}</td>
          <td>{student.course}</td>
          <td>{student.address}</td>  {/* ✅ Added Address */}
          <td>{student.yearLevel}</td>  {/* ✅ Added Year Level */}
          <td>{student.college}</td>
          <td>
          <Button variant="warning" className="me-2" onClick={() => handleEditStudent(student)}>
  Edit
</Button>
<Button variant="danger" onClick={() => handleDeleteStudent(student.id)}>
  Delete
</Button>

          </td>
        </tr>
      ))}
    </tbody>
  </Table>
  
  
  
  
        {/* Visualization Section at the Bottom */}
        <VisualizationSection 
          students={students} 
          chartCategory={chartCategory} 
          setChartCategory={setChartCategory} 
        />
  
        <ToastContainer />
  
        {/* Add/Edit Student Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
    <Modal.Header closeButton>
      <Modal.Title>{editingStudent ? 'Edit Student' : 'Add Student'}</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <Form>
        <Form.Group>
          <Form.Label>ID</Form.Label>
          <Form.Control type="text" name="id" value={formData.id} onChange={handleInputChange} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" name="name" value={formData.name} onChange={handleInputChange} required />
        </Form.Group>
        <Form.Group>
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Age</Form.Label>
          <Form.Control type="number" name="age" value={formData.age} onChange={handleInputChange} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Phone</Form.Label>
          <Form.Control type="text" name="phone" value={formData.phone} onChange={handleInputChange} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Course</Form.Label>
          <Form.Select name="course" value={formData.course} onChange={handleInputChange}>
            <option value="">Select Course</option>
            <option value="BSCE">BSCE</option>
            <option value="BSIT">BSIT</option>
            <option value="BSCS">BSCS</option>
            <option value="BSEE">BSEE</option>
            <option value="BSA">BSA</option>
            <option value="BSN">BSN </option>
            <option value="BSSTAT">BSSTAT</option>
            <option value="BSPsych">BSPsych</option>
            <option value="BSCerE">BSCerE</option>
            <option value="BSChe">BSChem</option>
            <option value="BSCpE">BSCpE</option>
            <option value="BSME">BSME</option>
            <option value="BSBIO">BSBIO</option>
            <option value="BSIS">BSIS</option>
            <option value="BSCA">BSCA</option>
            <option value="BEEd">BEEd</option>
            <option value="BSEd">BSEd</option>
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label>Address</Form.Label>  {/* ✅ Added Address */}
          <Form.Control type="text" name="address" value={formData.address} onChange={handleInputChange} />
        </Form.Group>
        <Form.Group>
          <Form.Label>Year Level</Form.Label>  {/* ✅ Added Year Level */}
          <Form.Select name="yearLevel" value={formData.yearLevel} onChange={handleInputChange}>
            <option value="">Select Year Level</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
            <option value="5th Year">5th Year</option>
          </Form.Select>
        </Form.Group>
        <Form.Group>
          <Form.Label>College</Form.Label>
          <Form.Select name="college" value={formData.college} onChange={handleInputChange}>
            <option value="">Select College</option>
            <option value="CCS">CCS</option>
            <option value="CSM">CSM</option>
            <option value="COE">COE</option>
            <option value="CASS">CASS</option>
            <option value="CED">CED</option>
            <option value="CEBA">CEBA</option>
            <option value="CON">CON</option>
          </Form.Select>
        </Form.Group>
      </Form>
    </Modal.Body>
    <Modal.Footer>
      <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
      <Button variant="primary" onClick={handleAddOrEditStudent}>{editingStudent ? 'Update' : 'Add'}</Button>
    </Modal.Footer>
  </Modal>
  
  
      </div>
    );
  };
  
  export default Admin;
  