import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { register } from '../api/sdk'; // Assuming this function exists in sdk.js
import styled from 'styled-components';
import colors from '../styles/colors';


const RegistrationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #2c2f33; 
  color: white;
`;

const RegistrationForm = styled.form`
  background-color: #23272a; /* Slightly darker background for the form */
  padding: 20px 30px; /* Add horizontal padding */
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 320px; /* Increase width slightly to accommodate padding */
  box-sizing: border-box; /* Ensure padding is included in the width */
`;

const Title = styled.h2`
  margin-bottom: 20px;
  text-align: center;
`;

const ErrorMessage = styled.p`
  color: #ff4d4f;
  margin-bottom: 10px;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%; /* Ensure input takes full width of the container */
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
  background-color: #3a3f45;
  color: white;
  outline: none;
  box-sizing: border-box; /* Include padding and border in the width calculation */

  &:focus {
    border-color: ${colors.primary};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 10px;
  background-color: ${colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;

  &:hover {
    background-color: ${colors.primaryHover};
  }

  &:active {
    background-color: ${colors.primaryActive};
  }
`;

const LoginLink = styled.p`
  margin-top: 10px;
  text-align: center;

  a {
    color: ${colors.primary};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const RegistrationPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

  useEffect(()=>{
    const currentUserId = localStorage.getItem('user_id');
    const token = localStorage.getItem('token');
    if(currentUserId && token){
      window.location.href = '/home';
    }
  },[])

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register({ name, user_id: username, password });
      history.push('/login'); // Redirect to login after successful registration
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <RegistrationContainer>
      <RegistrationForm onSubmit={handleSubmit}>
        <Title>Register</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <FormGroup>
          <Label>Name</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>Username</Label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label>Confirm Password</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </FormGroup>
        <SubmitButton type="submit">Register</SubmitButton>
      </RegistrationForm>
      <LoginLink>
        Already have an account? <a href="/login">Login</a>
      </LoginLink>
    </RegistrationContainer>
  );
};

export default RegistrationPage;