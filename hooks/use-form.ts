import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from './use-api';
import { z } from 'zod';

/**
 * Type for form errors, mapping each field to an optional error message
 */
type FormErrors<T> = {
  [K in keyof T]?: string;
};

export interface UseFormOptions<T> {
  /**
   * The initial form values
   */
  initialValues: T;
  
  /**
   * A Zod schema for validation
   */
  validationSchema?: z.ZodSchema<T>;
  
  /**
   * The API endpoint to submit the form to
   */
  endpoint: string;
  
  /**
   * The HTTP method to use for the request
   * @default 'POST'
   */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  
  /**
   * Callback function called when the form is submitted successfully
   * @param data The response data from the API
   */
  onSuccess?: (data: any) => void;
  
  /**
   * Callback function called when the form submission fails
   * @param error The error that occurred
   */
  onError?: (error: { message: string; status?: number; details?: unknown }) => void;
  
  /**
   * Callback function called when the form submission is complete (success or error)
   */
  onComplete?: () => void;
  
  /**
   * If true, the form will not automatically redirect on success
   * @default false
   */
  noRedirect?: boolean;
  
  /**
   * The URL to redirect to on success
   * If not provided, the form will not redirect
   */
  successRedirect?: string;
}

export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const {
    initialValues,
    validationSchema,
    endpoint,
    method = 'POST',
    onSuccess,
    onError,
    onComplete,
    noRedirect = false,
    successRedirect,
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const router = useRouter();
  const { request } = useApi<unknown>();

  /**
   * Validate the form against the provided schema
   */
  const validate = useCallback((): boolean => {
    if (!validationSchema) return true;

    try {
      validationSchema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: FormErrors<T> = {};
        
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof T;
          newErrors[path] = err.message;
        });
        
        setErrors(newErrors);
      }
      return false;
    }
  }, [values, validationSchema]);

  /**
   * Handle input change
   */
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target;
      
      // Handle different input types
      let finalValue: any = value;
      
      if (type === 'number') {
        finalValue = value === '' ? '' : Number(value);
      } else if (type === 'checkbox') {
        finalValue = (e.target as HTMLInputElement).checked;
      }
      
      setValues((prev) => ({
        ...prev,
        [name]: finalValue,
      }));
      
      // Clear error for this field if it exists
      if (errors[name as keyof T]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name as keyof T];
          return newErrors;
        });
      }
    },
    [errors]
  );

  /**
   * Set a specific field value
   */
  const setFieldValue = useCallback(<K extends keyof T>(name: K, value: T[K]): void => {
    setValues((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error for this field if it exists
    setErrors((prev) => {
      if (prev[name]) {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
      return prev;
    });
  }, []);

  /**
   * Set a specific field error
   */
  const setFieldError = useCallback(<K extends keyof T>(name: K, error: string) => {
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  }, []);

  /**
   * Reset the form to its initial values
   */
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setSubmitError(null);
  }, [initialValues]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      
      // Validate the form
      if (validationSchema && !validate()) {
        return;
      }
      
      setIsSubmitting(true);
      setSubmitError(null);
      
      try {
        // Make the API request using the request method
        const response = await request(
          method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete',
          endpoint,
          ['get', 'delete'].includes(method.toLowerCase()) ? undefined : values
        );
        
        if (response.error) {
          throw new Error(response.error.message || 'An error occurred');
        }
        
        // Call the success callback
        onSuccess?.(response.data);
        
        // Redirect if needed
        if (!noRedirect && successRedirect) {
          router.push(successRedirect);
        }
        
        return response.data;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setSubmitError(errorMessage);
        onError?.({ message: errorMessage });
        throw error;
      } finally {
        setIsSubmitting(false);
        onComplete?.();
      }
    },
    [
      validationSchema,
      validate,
      method,
      endpoint,
      values,
      noRedirect,
      successRedirect,
      onSuccess,
      onError,
      onComplete,
      router,
      request
    ]
  );

  return {
    // Form state
    values,
    errors,
    isSubmitting,
    submitError,
    
    // Form actions
    handleChange,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setValues,
    setErrors,
    resetForm,
    
    // Validation
    validate,
    isValid: Object.keys(errors).length === 0,
  };
}

export default useForm;
