import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, UserPlus, X, ShieldAlert, GraduationCap } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export const LoginPromptModal = ({ isOpen, onClose, title = 'Please login to continue', message, returnUrl }) => {
  const navigate = useNavigate();
  const location = useLocation();

  if (!isOpen) return null;

  const currentPath = returnUrl || `${location.pathname}${location.search}`;

  const handleLogin = () => {
    onClose();
    navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleRegister = () => {
    onClose();
    navigate(`/register?role=STUDENT&redirect=${encodeURIComponent(currentPath)}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-5">
        <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200/80 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-teal-600 text-white shrink-0 shadow-xs">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-teal-950">Student Access Required</h4>
            <p className="text-xs text-teal-800 mt-0.5 leading-relaxed">
              {message || 'You must be logged in as a student to contact PG and Mess owners, send direct inquiries, save bookmarks, or post reviews.'}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <Button
            variant="primary"
            size="md"
            icon={LogIn}
            className="w-full justify-center shadow-xs"
            onClick={handleLogin}
          >
            Login as Student
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon={UserPlus}
            className="w-full justify-center"
            onClick={handleRegister}
          >
            Create Student Account
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-slate-500 hover:text-slate-700"
            onClick={onClose}
          >
            Cancel & Return
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default LoginPromptModal;

