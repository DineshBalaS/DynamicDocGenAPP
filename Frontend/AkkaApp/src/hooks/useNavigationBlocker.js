import { useState, useEffect, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';

/**
 * A custom hook to block navigation and show a confirmation modal.
 * This hook is robustly designed to handle the state transitions of react-router's blocker.
 * @param {boolean} isBlocked - A condition to determine if navigation should be blocked.
 */
export function useNavigationBlocker(isBlocked) {
  const [showModal, setShowModal] = useState(false);

  // useBlocker returns an object that changes based on navigation state.
  // It can be in 'unblocked', 'blocked', or 'proceeding' states.
  // The 'proceed' and 'reset' methods are only available when in the 'blocked' state.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isBlocked && currentLocation.pathname !== nextLocation.pathname
  );

  // This effect safely handles showing the modal ONLY when the blocker is active.
  useEffect(() => {
    // Check if the blocker exists and is in the 'blocked' state.
    if (blocker && blocker.state === 'blocked') {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
    // This effect should re-run whenever the blocker object itself changes.
  }, [blocker]);

  // This effect handles the browser's native "beforeunload" event (e.g., closing the tab).
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isBlocked) {
        event.preventDefault();
        event.returnValue = ''; // Required for legacy browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isBlocked]);

  // A stable, safe handler to confirm navigation.
  // useCallback ensures the function identity is stable unless the blocker changes.
  const handleConfirmNavigation = useCallback(() => {
    if (blocker && blocker.state === 'blocked') {
      // Proceed with the blocked navigation.
      blocker.proceed();
    }
    // The useEffect above will automatically hide the modal when the blocker state changes.
  }, [blocker]);


  // A stable, safe handler to cancel navigation.
  const handleCancelNavigation = useCallback(() => {
    if (blocker && blocker.state === 'blocked') {
      // Reset the blocker to its 'unblocked' state.
      blocker.reset();
    }
    // The useEffect above will automatically hide the modal when the blocker state changes.
  }, [blocker]);


  return {
    showModal,
    handleConfirmNavigation,
    handleCancelNavigation,
  };
}