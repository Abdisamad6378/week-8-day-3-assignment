import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Greeting from './Greeting';

describe('Greeting component', () => {
  it('renders correctly with heading and submit button', () => {
    render(<Greeting />);

    expect(screen.getByRole('heading', { name: 'Welcome' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    expect(screen.getByLabelText('Your name')).toBeInTheDocument();
  });

  it('shows greeting after submitting a name', async () => {
    const user = userEvent.setup();
    render(<Greeting />);

    await user.type(screen.getByLabelText('Your name'), 'Amina');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // findBy* keeps retrying (up to 1 second) until the text shows up
    expect(
      await screen.findByText('Hello, Amina! Welcome to Mctaba Academy.')
    ).toBeInTheDocument();
  });

  it('form submission updates the message', async () => {
    render(<Greeting />);

    // This time submit the form directly instead of clicking the button
    fireEvent.change(screen.getByPlaceholderText('Enter your name'), {
      target: { value: 'Ochieng' },
    });
    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }).closest('form'));

    expect(
      await screen.findByText('Hello, Ochieng! Welcome to Mctaba Academy.')
    ).toBeInTheDocument();
    // The form is replaced by the message
    expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
  });

  it('shows loading state after submit', async () => {
    const user = userEvent.setup();
    render(<Greeting />);

    await user.type(screen.getByLabelText('Your name'), 'Wanjiku');
    await user.click(screen.getByRole('button', { name: 'Submit' }));

    // Straight after the click the 100ms timer hasn't finished yet
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // ...and once it finishes, the loading text is gone
    await screen.findByText('Hello, Wanjiku! Welcome to Mctaba Academy.');
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('shows error when name is empty', async () => {
    const user = userEvent.setup();
    render(<Greeting />);

    await user.click(screen.getByRole('button', { name: 'Submit' }));

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Name is required');
    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });
});
