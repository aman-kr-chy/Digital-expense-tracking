import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetInvitationQuery, useRegisterMutation } from '../store/slices/authApiSlice';
import { setCredentials } from '../store/slices/authSlice';
import { UserPlus, Mail, Lock, User, AlertCircle } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get('invite');
  const dispatch = useDispatch();

  const [registerApiCall, { isLoading }] = useRegisterMutation();
  const { data: invitation, error: invitationError, isLoading: isLoadingInvitation } = useGetInvitationQuery(inviteToken, {
    skip: !inviteToken,
  });
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate('/');
    }
  }, [navigate, userInfo]);

  useEffect(() => {
    if (invitation?.email) setEmail(invitation.email);
  }, [invitation?.email]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    try {
      const res = await registerApiCall({ name, email, password, inviteToken }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate('/');
    } catch (err) {
      setErrorMsg(err?.data?.message || err.error || 'Failed to register');
    }
  };

  return (
    <div className="p-5 sm:p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-500">Join SplitEase to manage expenses effortlessly</p>
      </div>

      {inviteToken && (
        <div className="mb-6 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
          {isLoadingInvitation ? 'Checking your invitation...' : invitation ? (
            invitation.groupName
              ? <>You’re invited to join <strong>{invitation.groupName}</strong>. Create your account with <strong>{invitation.email}</strong>.</>
              : <>You’re invited to SplitEase. Create your account with <strong>{invitation.email}</strong>.</>
          ) : invitationError?.data?.message || 'This invitation could not be found.'}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      )}

      <form onSubmit={submitHandler} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              required
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary sm:text-sm transition-colors bg-gray-50 focus:bg-white"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              required
              readOnly={Boolean(inviteToken)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary sm:text-sm transition-colors bg-gray-50 focus:bg-white"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              required
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary sm:text-sm transition-colors bg-gray-50 focus:bg-white"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              required
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-primary focus:border-primary sm:text-sm transition-colors bg-gray-50 focus:bg-white"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isLoadingInvitation || Boolean(inviteToken && invitationError)}
          className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-70 disabled:cursor-not-allowed mt-2"
        >
          {isLoading ? 'Creating account...' : (
            <>
              Create Account <UserPlus className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default Register;
