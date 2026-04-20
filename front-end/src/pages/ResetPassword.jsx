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
import { useSearchParams } from 'react-router-dom';

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

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = String(searchParams.get('token') || '').trim();

    const [passwordError, setPasswordError] = React.useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('');
    const [confirmError, setConfirmError] = React.useState(false);
    const [confirmErrorMessage, setConfirmErrorMessage] = React.useState('');
    const [serverMessage, setServerMessage] = React.useState('');

    const validateInputs = (password, confirmPassword) => {
        setPasswordError(false);
        setPasswordErrorMessage('');
        setConfirmError(false);
        setConfirmErrorMessage('');

        if (!token) {
            setServerMessage('Invalid reset link. Please request another password reset.');
            return false;
        }

        if (!password || password.length < 8) {
            setPasswordError(true);
            setPasswordErrorMessage('Password must be at least 8 characters.');
            return false;
        }

        if (password !== confirmPassword) {
            setConfirmError(true);
            setConfirmErrorMessage('Passwords do not match.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setServerMessage('');

        const form = event.currentTarget;
        const data = new FormData(form);
        const newPassword = String(data.get('newPassword') || '');
        const confirmPassword = String(data.get('confirmPassword') || '');

        if (!validateInputs(newPassword, confirmPassword)) return;

        try {
            const response = await fetch('http://localhost:4000/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword }),
            });

            const rawBody = await response.text();
            let result = {};
            try {
                result = rawBody ? JSON.parse(rawBody) : {};
            } catch {
                result = {};
            }

            if (response.ok && result.ok) {
                setServerMessage(
                    result.message ||
                    'Password successfully reset, click here to return to login.'
                );
                form?.reset();
            } else {
                setServerMessage(result.message || `Request failed (${response.status}). Please try again.`);
            }
        } catch (error) {
            console.error('Server error:', error);
            setServerMessage('Could not reach server. Make sure backend is running on port 4000.');
        }
    };

    return (
        <Card variant="outlined">
            <Typography
                component="h1"
                variant="h4"
                sx={{ fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
                Reset Password
            </Typography>

            <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
            >
                Enter your new password:

                <FormControl>
                    <FormLabel htmlFor="newPassword">New password</FormLabel>
                    <TextField
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        fullWidth
                        autoComplete="new-password"
                        error={passwordError}
                        helperText={passwordErrorMessage}
                    />
                </FormControl>

                <FormControl>
                    <FormLabel htmlFor="confirmPassword">Confirm new password</FormLabel>
                    <TextField
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        fullWidth
                        autoComplete="new-password"
                        error={confirmError}
                        helperText={confirmErrorMessage}
                    />
                </FormControl>

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                >
                    Update password
                </Button>

                {serverMessage && (
                    <Typography sx={{ textAlign: 'center' }} color="text.secondary">
                        {serverMessage}
                    </Typography>
                )}

                {serverMessage === 'Password successfully reset, click here to return to login.' && (
                    <Typography sx={{ textAlign: 'center' }}>
                        <Link href="/login" variant="body2">
                            Click here to return to login.
                        </Link>
                    </Typography>
                )}

                <Divider />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography sx={{ textAlign: 'center' }}>
                        Remembered your password?{' '}
                        <Link href="/login" variant="body2">
                            Back to login
                        </Link>
                    </Typography>
                </Box>
            </Box>
        </Card>
    );
}
