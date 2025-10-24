// src/components/layout/MainLayout.jsx

import React from 'react';
// - Remove the old Outlet import if it was separate
// + Import Outlet and useLocation from react-router-dom
import { Outlet, useLocation } from 'react-router-dom';
// + Import motion and AnimatePresence from framer-motion
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../common/Header';

// + Define the animation variants for sliding and fading
const pageVariants = {
  initial: { // State before entering
    opacity: 0,
    x: '50vw', // Start slightly off-screen to the right (adjust value as needed)
  },
  in: { // State when visible
    opacity: 1,
    x: 0, // Animate to on-screen (center)
  },
  out: { // State when exiting
    opacity: 0,
    x: '-50vw', // Animate off-screen to the left (adjust value as needed)
  },
};

// + Define the transition properties for smoothness
const pageTransition = {
  type: 'tween',      // Ensures smooth interpolation between states
  ease: 'easeInOut', // Adds a subtle anticipation/overshoot effect for flow
  duration: 0.5,      // Animation duration in seconds (adjust for speed)
};

function MainLayout() {
  // + Get the current location object from React Router
  const location = useLocation();

  return (
    // + Add flex and flex-col to make the layout a flex container column
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      {/*
       + Wrap the changing part (main content) in AnimatePresence.
       + mode="wait" ensures the exiting page finishes its animation
       + before the entering page starts animating.
      */}
      <AnimatePresence mode="wait">
        {/*
         + Add flex-grow to the main element so it takes up remaining vertical space.
         + Keep your existing container and padding styles.
        */}
        <main className="container mx-auto px-6 py-8 flex-grow">
          {/*
           + Wrap the Outlet in motion.div. This is the element that will animate.
           + key={location.pathname}: This is VERY important. It tells AnimatePresence
           +   that the component has changed when the URL pathname changes,
           +   triggering the enter/exit animations.
           + initial="initial": Apply the 'initial' variant styles when the component first mounts or enters.
           + animate="in": Apply the 'in' variant styles when the component is visible.
           + exit="out": Apply the 'out' variant styles when the component is unmounting or exiting.
           + variants={pageVariants}: Link the animation states to our defined variants object.
           + transition={pageTransition}: Apply our defined transition timing and easing.
          */}
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
          >
            {/* Child routes (DashboardPage, UploadWorkflowPage) render here */}
            <Outlet />
          </motion.div>
        </main>
      </AnimatePresence>
    </div>
  );
}

export default MainLayout;