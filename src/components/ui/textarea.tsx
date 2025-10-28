import * as React from "react";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={`border border-gray-300 rounded-md px-3 py-2 w-full ${className}`}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
