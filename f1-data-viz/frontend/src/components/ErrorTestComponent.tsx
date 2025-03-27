import React, { useState } from "react";

interface ErrorTestComponentProps {
  componentName: string;
}

/**
 * A test component that can be used to demonstrate error boundary functionality
 * by deliberately triggering an error on button click.
 */
const ErrorTestComponent: React.FC<ErrorTestComponentProps> = ({
  componentName,
}) => {
  const [shouldError, setShouldError] = useState(false);

  // This will trigger an error when shouldError is true
  if (shouldError) {
    // Deliberately throw an error to test error boundary
    throw new Error(`Test error in ${componentName}`);
  }

  return (
    <div className="p-4 border border-yellow-500 bg-yellow-900/30 rounded mb-4">
      <h3 className="text-lg font-bold mb-2">
        Error Boundary Test: {componentName}
      </h3>
      <p className="text-sm mb-3">
        Click the button below to simulate an error in this component.
      </p>
      <button
        onClick={() => setShouldError(true)}
        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
      >
        Trigger Error
      </button>
    </div>
  );
};

export default ErrorTestComponent;
