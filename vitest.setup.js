// Adds DOM matchers like toBeInTheDocument() and toHaveTextContent()
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Remove whatever the last test rendered so tests don't see each other's DOM
afterEach(() => {
  cleanup();
});
