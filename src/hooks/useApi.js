import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/helpers';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const { 
      showSuccessToast = false, 
      showErrorToast = true,
      successMessage,
      onSuccess,
      onError,
    } = options;

    setLoading(true);
    setError(null);

    try {
      const response = await apiCall();
      setData(response.data);
      
      if (showSuccessToast) {
        toast.success(successMessage || response.data?.message || 'Success!');
      }
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      
      if (showErrorToast) {
        toast.error(errorMessage);
      }
      
      if (onError) {
        onError(errorMessage);
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
    setData(null);
  }, []);

  return { loading, error, data, execute, reset };
};

export default useApi;