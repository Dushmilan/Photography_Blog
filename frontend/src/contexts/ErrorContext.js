import React, { createContext, useContext, useReducer } from 'react';
import ErrorNotification from '../components/ErrorNotification';
import SuccessNotification from '../components/SuccessNotification';

const ErrorContext = createContext();

const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          ...state.notifications,
          {
            id: Date.now() + Math.random(),
            message: action.payload.message,
            type: action.payload.type,
            duration: action.payload.duration
          }
        ]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload.id)
      };
    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };
    default:
      return state;
  }
};

export const ErrorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notificationReducer, { notifications: [] });

  const addNotification = (message, type = 'error', duration = 5000) => {
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: { message, type, duration }
    });
  };

  const removeNotification = (id) => {
    dispatch({
      type: 'REMOVE_NOTIFICATION',
      payload: { id }
    });
  };

  const clearNotifications = () => {
    dispatch({
      type: 'CLEAR_NOTIFICATIONS'
    });
  };

  // Create aliases for backward compatibility
  const addError = (message, type = 'error', duration = 5000) => addNotification(message, type, duration);
  const addSuccess = (message, duration = 3000) => addNotification(message, 'success', duration);

  return (
    <ErrorContext.Provider value={{
      notifications: state.notifications,
      addError,
      addSuccess,
      removeNotification,
      clearNotifications
    }}>
      {children}
      {state.notifications.map(notification => (
        notification.type === 'success' ? (
          <SuccessNotification
            key={notification.id}
            message={notification.message}
            isVisible={true}
            onClose={() => removeNotification(notification.id)}
            duration={notification.duration}
          />
        ) : (
          <ErrorNotification
            key={notification.id}
            message={notification.message}
            type={notification.type}
            isVisible={true}
            onClose={() => removeNotification(notification.id)}
            duration={notification.duration}
          />
        )
      ))}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};