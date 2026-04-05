import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Signup from '../Signup';
import '@testing-library/jest-dom';

describe('Signup Component Validation', () => {
  it('renders the core signup form UI', () => {
    render(<Signup onSignup={() => {}} onSwitchToLogin={() => {}} />);
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
  });

  it('displays a validation error when fields are entirely empty', async () => {
    render(<Signup onSignup={() => {}} onSwitchToLogin={() => {}} />);
    
    const submitBtn = screen.getByRole('button', { name: /create account/i });
    
    await act(async () => {
      fireEvent.click(submitBtn);
    });
    
    // In Signup.js, the first error thrown is "Name is required"
    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
  });
});
