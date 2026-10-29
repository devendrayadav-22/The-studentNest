import React, { useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoginPromptModal from '../components/LoginPromptModal';

export const useRequireLogin = () => {
  const { isAuthenticated, role } = useAuth();
  const { error: toastError } = useToast();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const requireStudentAction = useCallback((callback, message = '') => {
    if (!isAuthenticated) {
      setCustomMessage(message);
      setModalOpen(true);
      return false;
    }

    if (role !== 'STUDENT') {
      toastError('Only students can contact owners or save listings.');
      return false;
    }

    if (callback) {
      callback();
    }
    return true;
  }, [isAuthenticated, role, toastError]);

  const LoginModal = useCallback(() => (
    <LoginPromptModal
      isOpen={modalOpen}
      onClose={() => setModalOpen(false)}
      message={customMessage}
      returnUrl={`${location.pathname}${location.search}`}
    />
  ), [modalOpen, customMessage, location.pathname, location.search]);

  return {
    isAuthenticated,
    isStudent: isAuthenticated && role === 'STUDENT',
    role,
    requireStudentAction,
    LoginModal,
    setModalOpen
  };
};

export default useRequireLogin;

