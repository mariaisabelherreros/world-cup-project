import React, {useState} from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import Link from '@mui/material/Link';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import MuiCard from '@mui/material/Card';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  maxWidth: 450,
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',

  boxShadow:
      'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',

  ...theme.applyStyles('dark', {
    boxShadow:
        'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}));

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [emailError, setEmailError] = React.useState(false);
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('');
  const [passwordError, setPasswordError] = React.useState(false);
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
  const [passwordMatchError, setPasswordMatchError] = React.useState(false);
  const [passwordMatchErrorMessage, setPasswordMatchErrorMessage] = React.useState('');
  const [nameError, setNameError] = React.useState(false);
  const [nameErrorMessage, setNameErrorMessage] = React.useState('');
  const [existingAccountError, setExistingAccountError] = React.useState(false);
  const [bannedEmailError, setBannedEmailError] = React.useState(false);


  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm({...form, [name]: value });
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const username = document.getElementById('username');

    if (!username.value) {
      setNameError(true);
      setNameErrorMessage('Username is required.');
      return;
    } else {
      setNameError(false);
      setNameErrorMessage('');
    }

    const emailRegex = /\S+@\S+\.\S+/;

    if (!email.value || !emailRegex.test(email.value)) {
      setEmailError(true);
      setEmailErrorMessage('Please enter a valid email address.');
      return;
    } else {
      setEmailError(false);
      setEmailErrorMessage('');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,32}$/;

    if (!password.value || !passwordRegex.test(password.value)
    ) {
      setPasswordError(true);
      setPasswordErrorMessage('Password must be between 8 and 32 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
      return;
    } else {
      setPasswordError(false);
      setPasswordErrorMessage('');
    }

    if (password.value !== confirmPassword.value) {
      setPasswordMatchError(true)
      setPasswordMatchErrorMessage('Passwords do not match.')
      return;
    } else {
      setPasswordMatchError(false);
      setPasswordMatchErrorMessage('');
    }

    const data = new FormData(event.currentTarget);

    const payload = {
      username: data.get('username'),
      email: data.get('email'),
      password: data.get('password'),
    };

    try {
      const response = await fetch('http://localhost:4000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        navigate("/login");
      } else {
        const result = await response.json();
        if (result.includes("banned")) {
          setBannedEmailError(true);
        } else {
          setExistingAccountError(true);
        }    
      }
    } catch (error) {
      console.error("Server error during registration:", error);
    }
  };

  return (
      <Card variant="outlined">

        <Typography
            component="h1"
            variant="h4"
            sx={{ fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
        >
          Sign up
        </Typography>

        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          {existingAccountError && <Alert severity="error"> Username/Email already in use! </Alert>}
          {bannedEmailError && <Alert severity="error">This email has been banned from the platform.</Alert>}
          <FormControl>
            <FormLabel htmlFor="username">Username</FormLabel>
            <TextField
                id="username"
                name="username"
                required
                fullWidth
                placeholder="PocketPlayer"
                autoComplete="username"
                error={nameError}
                helperText={nameErrorMessage}
                onChange={handleChange}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="email">Email</FormLabel>
            <TextField
                id="email"
                name="email"
                required
                fullWidth
                placeholder="your@email.com"
                autoComplete="email"
                error={emailError}
                helperText={emailErrorMessage}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="password">Password</FormLabel>
            <TextField
                id="password"
                name="password"
                type="password"
                required
                fullWidth
                placeholder="••••••"
                autoComplete="new-password"
                error={passwordError}
                helperText={passwordErrorMessage}
            />
          </FormControl>

          <FormControl>
            <FormLabel htmlFor="confirmPassword">Confirm password</FormLabel>
            <TextField
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                fullWidth
                placeholder="••••••"
                autoComplete="new-password"
                error={passwordMatchError}
                helperText={passwordMatchErrorMessage}
                onChange={handleChange}
            />
          </FormControl>

          <Button
              type="submit"
              fullWidth
              variant="contained"
          >
            Sign up
          </Button>
        </Box>

        <Divider>
          <Typography sx={{ color: 'text.secondary' }}>or</Typography>
        </Divider>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ textAlign: 'center' }}>
            Already have an account?{' '}
            <Link href="/login" variant="body2">
              Sign in
            </Link>
          </Typography>
        </Box>
      </Card>
  );
}