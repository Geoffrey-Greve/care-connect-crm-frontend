import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useToast } from '@/hooks/use-toast';
import { ErrorDialog } from '@/components/ErrorDialog';
import { useVerifyOtpMutation, useForgotPasswordMutation } from '@/redux/api/authApi';
import { useAppSelector } from '@/redux/store';

const OTPVerification = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifyOtp, { isLoading }] = useVerifyOtpMutation();
  const [forgotPassword, { isLoading: isResending }] = useForgotPasswordMutation();
  
  // Get email from Redux
  const email = useAppSelector((state) => state.auth.tempEmail);
  
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Redirect if no email is found
  useEffect(() => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please start from the forgot password page.",
        variant: "destructive",
      });
      navigate('/auth/forgot-password');
    }
  }, [email, navigate, toast]);

  useEffect(() => {
    // Start countdown timer
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOTPChange = (value: string) => {
    setOtp(value);
    setError('');
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter a complete 6-digit OTP');
      return;
    }

    if (!email) {
      setError('Email not found. Please restart the process.');
      return;
    }

    try {
      // Call the verify OTP API
      const response = await verifyOtp({ email, otp }).unwrap();

      if (response.status) {
        toast({
          title: "OTP Verified",
          description: response.message || "OTP verified successfully!",
        });
        
        // Navigate to set new password page
        navigate('/auth/set-password');
      }
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.data?.data?.message || error?.message || 'Invalid OTP. Please try again.';
      setError(errorMsg);
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(60);
    setOtp('');
    setError('');

    try {
      if (!email) return;
      
      // Call forgot password API again to resend OTP
      const response = await forgotPassword({ email }).unwrap();
      
      if (response.status) {
        toast({
          title: "OTP Resent",
          description: response.message || `A new OTP has been sent to ${email}`,
        });
      }
    } catch (error: any) {
      const errorMsg = error?.data?.message || error?.data?.data?.message || error?.message || 'Failed to resend OTP. Please try again.';
      setErrorMessage(errorMsg);
      setIsErrorDialogOpen(true);
      setCanResend(true);
      setResendTimer(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-4 top-4"
            onClick={() => navigate('/auth/login')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <CardTitle className="text-3xl font-bold">Verify OTP</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={handleOTPChange}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOTP}
                  disabled={!canResend || isLoading}
                  className="text-sm"
                >
                  {canResend ? (
                    'Resend OTP'
                  ) : (
                    `Resend OTP in ${formatTime(resendTimer)}`
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || otp.length !== 6}
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Security Tip:</p>
                <p>Never share your OTP with anyone. Our team will never ask for your OTP.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Dialog */}
      <ErrorDialog
        open={isErrorDialogOpen}
        onOpenChange={setIsErrorDialogOpen}
        message={errorMessage}
      />
    </div>
  );
};

export default OTPVerification;

