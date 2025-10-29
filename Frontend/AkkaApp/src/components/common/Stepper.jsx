// src/components/common/Stepper.jsx

import React from 'react';

function Stepper({ currentStep, steps }) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="grid" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
        {steps.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentStep;
          const isActive = stepIdx === currentStep;
          const isUpcoming = stepIdx > currentStep;

          return (
            <li key={step.name} className="relative">
              {/* Connecting Line (not for the last step) */}
              {stepIdx !== steps.length - 1 && (
                <div
                  className={`absolute left-1/2 top-4 -ml-px mt-0.5 h-0.5 w-full ${
                    isCompleted ? 'bg-teal-500' : 'bg-gray-300'
                  }`}
                  aria-hidden="true"
                />
              )}
              
              <div className="relative flex flex-col items-center gap-y-2">
                {/* Bubble */}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
                    isCompleted ? 'bg-teal-500 text-white' :
                    isActive ? 'border-2 border-teal-500 bg-white text-teal-500' :
                    'border-2 border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {stepIdx + 1}
                </div>
                {/* Text */}
                <span className={`text-sm font-medium ${isActive ? 'text-teal-600' : 'text-gray-500'}`}>
                  {step.name}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Stepper;