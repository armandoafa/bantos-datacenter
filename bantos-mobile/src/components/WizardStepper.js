import React from 'react';
import { View, Text } from 'react-native';

const WizardStepper = ({ steps, currentStep }) => {
  return (
    <View className="bg-white px-6 py-4 border-b border-slate-200">
      <View className="flex-row items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;
          
          return (
            <View key={stepNumber} className="items-center flex-1">
              <View className="flex-row items-center w-full">
                {/* Left Line */}
                <View className={`h-1 flex-1 ${index === 0 ? 'bg-transparent' : isCompleted || isActive ? 'bg-blue-600' : 'bg-slate-200'}`} />
                
                {/* Circle */}
                <View className={`w-8 h-8 rounded-full items-center justify-center border-2 z-10 ${isActive ? 'bg-blue-600 border-blue-600' : isCompleted ? 'bg-white border-blue-600' : 'bg-white border-slate-300'}`}>
                  {isCompleted ? (
                    <Text className="text-blue-600 font-bold">✓</Text>
                  ) : (
                    <Text className={isActive ? 'text-white font-bold' : 'text-slate-400 font-bold'}>{stepNumber}</Text>
                  )}
                </View>
                
                {/* Right Line */}
                <View className={`h-1 flex-1 ${index === steps.length - 1 ? 'bg-transparent' : isCompleted ? 'bg-blue-600' : 'bg-slate-200'}`} />
              </View>
              <Text className={`text-[10px] font-black uppercase tracking-widest mt-2 text-center ${isActive ? 'text-blue-600' : isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                {step}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default WizardStepper;
