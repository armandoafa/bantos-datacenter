import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

const POSButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'large',
  icon: Icon,
  disabled = false,
  loading = false,
  className = ''
}) => {
  
  const getVariantStyles = () => {
    switch(variant) {
      case 'secondary':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'danger':
        return 'bg-red-500 text-white border-red-600';
      case 'success':
        return 'bg-green-600 text-white border-green-700';
      case 'outline':
        return 'bg-transparent text-slate-700 border-slate-300 border-2';
      case 'primary':
      default:
        return 'bg-blue-700 text-white border-blue-800';
    }
  };

  const getTextStyles = () => {
    switch(variant) {
      case 'secondary': return 'text-blue-700';
      case 'outline': return 'text-slate-700';
      default: return 'text-white';
    }
  };

  const getSizeStyles = () => {
    switch(size) {
      case 'small': return 'h-12 px-4 text-base';
      case 'huge': return 'h-20 px-8 text-2xl';
      case 'large':
      default: return 'h-16 px-6 text-xl'; // Default large for POS (min 64dp)
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      className={`
        flex-row items-center justify-center rounded-xl border-b-4
        ${getVariantStyles()} 
        ${getSizeStyles()} 
        ${disabled ? 'opacity-50' : 'opacity-100'} 
        ${className}
      `}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'secondary' ? '#1d4ed8' : '#ffffff'} />
      ) : (
        <>
          {Icon && <Icon size={size === 'huge' ? 32 : 24} color={variant === 'outline' || variant === 'secondary' ? '#1d4ed8' : '#ffffff'} className="mr-2" />}
          <Text className={`font-bold ${getTextStyles()} ${size === 'huge' ? 'text-2xl' : size === 'small' ? 'text-base' : 'text-xl'}`}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

export default POSButton;
