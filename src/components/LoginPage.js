import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from "jwt-decode";
import { login, loginViaGoogle } from '../api/sdk'; // Assuming login function is defined in sdk.js
import styled from 'styled-components';
import colors from '../styles/colors';

const LoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #2c2f33; 
  color: white;
`;

const LoginForm = styled.form`
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

const RegisterLink = styled.p`
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

const VerticalSpace = styled.div`
  margin: 8px 0;
`;

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const history = useHistory();

    useEffect(()=>{
      const currentUserId = localStorage.getItem('user_id');
      const token = localStorage.getItem('token');
      if(currentUserId && token){
        window.location.href = '/home';
      }
    },[])

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(username, password);
      history.push('/home'); // Redirect to home page on successful login
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  const handleSuccess = async (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("User Info:", decoded); // name, email, picture, etc.
    try {
      await loginViaGoogle(credentialResponse.credential);
      history.push('/home'); // Redirect to home page on successful login
    } catch (err) {
      setError('Something went wrong');
    }
  };

  const handleError = () => {
    console.log("Login Failed");
  };

  return (
    <LoginContainer>
      <LoginForm onSubmit={handleLogin}>
        <Title>Login</Title>
        {error && <ErrorMessage>{error}</ErrorMessage>}
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
        <SubmitButton type="submit">Login</SubmitButton>
        <VerticalSpace/>
        <div style={{ textAlign: 'center' }}>
        or
        </div>
        <VerticalSpace />
        <GoogleLogin auto_select useOneTap width={"auto"} theme="filled_black" onSuccess={handleSuccess} onError={handleError} />

      </LoginForm>
      <RegisterLink>
        Don't have an account? <a href="/register">Register here</a>
      </RegisterLink>
    </LoginContainer>
  );
};

export default LoginPage;