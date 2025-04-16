import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import HomePage from './components/HomePage';
import MeetingPage from './components/MeetingPage';
import './styles/theme.css';

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/register" component={RegistrationPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/meet/:roomId" component={MeetingPage} />
        <Route path="/" component={HomePage} />
        
      </Switch>
    </Router>
  );
};

export default App;