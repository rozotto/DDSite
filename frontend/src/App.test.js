import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

test('testing tests', () => {
  render(<App />);
  const linkElement = screen.getByText(/The date/i);
  expect(linkElement).toBeInTheDocument();
});
