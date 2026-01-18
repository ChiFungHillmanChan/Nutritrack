/**
 * CameraScreen - Food photo capture and AI analysis
 *
 * Main screen for capturing food photos and getting AI-powered
 * nutrition analysis. Uses extracted components for maintainability.
 */

import { useState, useCallback } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { useFoodStore } from '../../stores/foodStore';
import { useTranslation } from '../../hooks/useTranslation';
import { MealType } from '../../types';
import { analyzeFood as analyzeFoodAI } from '../../services/ai';
import {
  CaptureSection,
  ImagePreview,
  MealTypeSelector,
  AnalyzeButton,
  AnalysisResult,
} from '../../components/camera';
import { MEAL_TYPES, AnalysisResultData } from '../../components/camera/types';

export default function CameraScreen() {
  const { user } = useUserStore();
  const { addFoodLog } = useFoodStore();
  const { t } = useTranslation();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResultData | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('camera.permissionRequired'), t('camera.cameraPermission'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
      setAnalysisResult(null);
    }
  }, [t]);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('camera.permissionRequired'), t('camera.galleryPermission'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setImageBase64(result.assets[0].base64 ?? null);
      setAnalysisResult(null);
    }
  }, [t]);

  const handleAnalyze = useCallback(async () => {
    if (!imageBase64) return;

    setIsAnalyzing(true);
    try {
      const mealTypeLabel = t(
        MEAL_TYPES.find((meal) => meal.type === selectedMealType)?.labelKey ?? 'mealTypes.lunch'
      );

      const response = await analyzeFoodAI(imageBase64, mealTypeLabel);

      if (response.success && response.data) {
        setAnalysisResult({
          food_name: response.data.food_name,
          portion_size_grams: response.data.portion_size_grams,
          nutrition: response.data.nutrition,
          confidence: response.data.confidence,
        });
      } else {
        Alert.alert(t('camera.analysisFailed'), response.error ?? t('camera.tryAgain'));
      }
    } catch {
      Alert.alert(t('camera.analysisFailed'), t('camera.tryAgain'));
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageBase64, selectedMealType, t]);

  const handleSave = useCallback(async () => {
    if (!user?.id || !analysisResult) return;

    const isSuccessful = await addFoodLog({
      user_id: user.id,
      meal_type: selectedMealType,
      food_name: analysisResult.food_name,
      portion_size: analysisResult.portion_size_grams,
      nutrition_data: analysisResult.nutrition,
      image_url: imageUri ?? undefined,
      ai_confidence: analysisResult.confidence,
      logged_at: new Date().toISOString(),
    });

    if (isSuccessful) {
      Alert.alert(
        t('camera.recorded'),
        t('camera.recordedMessage', { food: analysisResult.food_name })
      );
      setImageUri(null);
      setImageBase64(null);
      setAnalysisResult(null);
    } else {
      Alert.alert(t('camera.saveFailed'), t('camera.tryAgain'));
    }
  }, [user?.id, analysisResult, selectedMealType, imageUri, addFoodLog, t]);

  const handleReset = useCallback(() => {
    setImageUri(null);
    setImageBase64(null);
    setAnalysisResult(null);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Image Preview or Capture Area */}
      {!imageUri ? (
        <CaptureSection onTakePhoto={handleTakePhoto} onPickImage={handlePickImage} />
      ) : (
        <ImagePreview
          imageUri={imageUri}
          confidence={analysisResult?.confidence}
          onReset={handleReset}
        />
      )}

      {/* Meal Type Selection */}
      {imageUri && (
        <MealTypeSelector
          selectedMealType={selectedMealType}
          onSelectMealType={setSelectedMealType}
        />
      )}

      {/* Analyze Button */}
      {imageUri && !analysisResult && (
        <AnalyzeButton isAnalyzing={isAnalyzing} onAnalyze={handleAnalyze} />
      )}

      {/* Analysis Result */}
      {analysisResult && <AnalysisResult result={analysisResult} onSave={handleSave} />}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: SPACING.lg,
  },
  bottomSpacer: {
    height: SPACING['2xl'],
  },
});
