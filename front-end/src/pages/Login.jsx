import * as React from 'react';
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
import { useNavigate} from 'react-router-dom';

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
            'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px'

    }),
}));

export default function Login() {
    const navigate = useNavigate();
    //  We shouldn't have to validate if email or users are valid, as they must have registered before seeing this page.

    const [nameError, setNameError] = React.useState(false);
    const [nameErrorMessage, setNameErrorMessage] = React.useState('');
    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');

    const validateInputs = () => {
        const username = document.getElementById('username');
        const password = document.getElementById('password');

        let isValid = true;
    // || !/\S+@\S+\.\S+/.test(username.value)
        if (!username.value) {
            setNameError(true);
            setNameErrorMessage('Please enter a valid email address.');
            isValid = false;
        } else {
            setNameError(false);
            setNameErrorMessage('');
        }

        if (!password.value) {
            setPasswordError(true);
            setPasswordErrorMessage('Password is required.');
            isValid = false;
        } else {
            setPasswordError(false);
            setPasswordErrorMessage('');
        }

        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateInputs()) return;

        const data = new FormData(event.currentTarget);

        const payload = {
            username: data.get('username'),
            password: data.get('password'),
        };

        try {
            const response = await fetch('http://localhost:4000/login', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (result.ok) {
                navigate("/home");
            } else {
                alert(result.message || "Invalid credentials");
            }
        } catch (error) {
            console.error("Server error during login:", error);
        }
    };

    return (
        <Card variant="outlined">

            <Typography
                component="h1"
                variant="h4"
                sx={{fontSize: 'clamp(2rem, 10vw, 2.15rem)'}}
            >
                Sign In
            </Typography>

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{display: 'flex', flexDirection: 'column', gap: 2}}
            >
                <FormControl>
                    <FormLabel htmlFor="username">Username or Email</FormLabel>
                    <TextField
                        id="username"
                        name="username"
                        required
                        fullWidth
                        placeholder="PocketPlayer or pocketplayer@email.com"
                        autoComplete="username"
                        error={nameError}
                        helperText={nameErrorMessage}
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

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                >
                    Sign In
                </Button>

                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                    <Typography sx={{textAlign: 'center'}}>
                        Forgot your password? {' '}
                        <Link href="/forgot_password" variant="body2">
                            Click here to reset it.
                        </Link>
                    </Typography>
                </Box>
            </Box>

            <Divider>
                <Typography sx={{color: 'text.secondary'}}>or</Typography>
            </Divider>

            <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                <Typography sx={{textAlign: 'center'}}>
                    Not registered?{' '}
                    <Link href="/register" variant="body2">
                        Click here to sign up!
                    </Link>
                </Typography>
            </Box>
        </Card>
    );
}