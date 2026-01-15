import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { useFoodStore } from '../../stores/foodStore';
import { Ionicons } from '@expo/vector-icons';
import { MealType, NutritionData } from '../../types';

// Mock AI analysis for MVP (will be replaced with real Gemini API)
async function analyzeFood(_base64: string): Promise<{
  food_name: string;
  portion_size_grams: number;
  nutrition: NutritionData;
  confidence: number;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock response - in production, this calls Gemini API
  return {
    food_name: '白飯',
    portion_size_grams: 200,
    nutrition: {
      calories: 260,
      protein: 5,
      carbs: 56,
      fat: 0.5,
      fiber: 0.6,
      sodium: 2,
    },
    confidence: 0.85,
  };
}

export default function CameraScreen() {
  const { user } = useUserStore();
  const { addFoodLog } = useFoodStore();
  
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    food_name: string;
    portion_size_grams: number;
    nutrition: NutritionData;
    confidence: number;
  } | null>(null);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('lunch');

  const handleTakePhoto = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要權限', '請允許 Nutritrack 使用相機');
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
  }, []);

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('需要權限', '請允許 Nutritrack 存取相簿');
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
  }, []);

  const handleAnalyze = useCallback(async () => {
    if (!imageBase64) return;

    setIsAnalyzing(true);
    try {
      const result = await analyzeFood(imageBase64);
      setAnalysisResult(result);
    } catch {
      Alert.alert('分析失敗', '請再試一次');
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageBase64]);

  const handleSave = useCallback(async () => {
    if (!user?.id || !analysisResult) return;

    const success = await addFoodLog({
      user_id: user.id,
      meal_type: selectedMealType,
      food_name: analysisResult.food_name,
      portion_size: analysisResult.portion_size_grams,
      nutrition_data: analysisResult.nutrition,
      image_url: imageUri ?? undefined,
      ai_confidence: analysisResult.confidence,
      logged_at: new Date().toISOString(),
    });

    if (success) {
      Alert.alert('已記錄', `${analysisResult.food_name} 已加入今日記錄`);
      // Reset state
      setImageUri(null);
      setImageBase64(null);
      setAnalysisResult(null);
    } else {
      Alert.alert('儲存失敗', '請再試一次');
    }
  }, [user?.id, analysisResult, selectedMealType, imageUri, addFoodLog]);

  const handleReset = useCallback(() => {
    setImageUri(null);
    setImageBase64(null);
    setAnalysisResult(null);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Image Preview or Capture Buttons */}
      {!imageUri ? (
        <View style={styles.captureSection}>
          <View style={styles.placeholder}>
            <Ionicons name="camera-outline" size={64} color={COLORS.textTertiary} />
            <Text style={styles.placeholderText}>影張食物相</Text>
          </View>
          
          <View style={styles.captureButtons}>
            <TouchableOpacity style={styles.captureButton} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={24} color={COLORS.textInverse} />
              <Text style={styles.captureButtonText}>影相</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.captureButton, styles.secondaryButton]} onPress={handlePickImage}>
              <Ionicons name="images" size={24} color={COLORS.primary} />
              <Text style={[styles.captureButtonText, styles.secondaryButtonText]}>相簿</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.previewSection}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Ionicons name="close" size={20} color={COLORS.textInverse} />
          </TouchableOpacity>
        </View>
      )}

      {/* Meal Type Selection */}
      {imageUri && (
        <View style={styles.mealTypeSection}>
          <Text style={styles.sectionTitle}>呢餐係</Text>
          <View style={styles.mealTypeButtons}>
            {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mealTypeButton,
                  selectedMealType === type && styles.mealTypeButtonSelected,
                ]}
                onPress={() => setSelectedMealType(type)}
              >
                <Text
                  style={[
                    styles.mealTypeButtonText,
                    selectedMealType === type && styles.mealTypeButtonTextSelected,
                  ]}
                >
                  {getMealTypeLabel(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Analyze Button */}
      {imageUri && !analysisResult && (
        <TouchableOpacity
          style={[styles.analyzeButton, isAnalyzing && styles.buttonDisabled]}
          onPress={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <ActivityIndicator color={COLORS.textInverse} />
              <Text style={styles.analyzeButtonText}>AI 分析緊...</Text>
            </>
          ) : (
            <>
              <Ionicons name="sparkles" size={20} color={COLORS.textInverse} />
              <Text style={styles.analyzeButtonText}>AI 分析食物</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* Analysis Result */}
      {analysisResult && (
        <View style={styles.resultSection}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>{analysisResult.food_name}</Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                {Math.round(analysisResult.confidence * 100)}% 準確度
              </Text>
            </View>
          </View>

          <Text style={styles.portionText}>
            估計份量: {analysisResult.portion_size_grams}g
          </Text>

          <View style={styles.nutritionGrid}>
            <NutritionItem
              label="卡路里"
              value={analysisResult.nutrition.calories}
              unit="kcal"
              color={COLORS.calories}
            />
            <NutritionItem
              label="蛋白質"
              value={analysisResult.nutrition.protein}
              unit="g"
              color={COLORS.protein}
            />
            <NutritionItem
              label="碳水"
              value={analysisResult.nutrition.carbs}
              unit="g"
              color={COLORS.carbs}
            />
            <NutritionItem
              label="脂肪"
              value={analysisResult.nutrition.fat}
              unit="g"
              color={COLORS.fat}
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Ionicons name="checkmark" size={20} color={COLORS.textInverse} />
            <Text style={styles.saveButtonText}>記錄呢餐</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

function NutritionItem({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <View style={styles.nutritionItem}>
      <View style={[styles.nutritionDot, { backgroundColor: color }]} />
      <Text style={styles.nutritionLabel}>{label}</Text>
      <Text style={styles.nutritionValue}>
        {Math.round(value)}{unit}
      </Text>
    </View>
  );
}

function getMealTypeLabel(type: MealType): string {
  const labels: Record<MealType, string> = {
    breakfast: '早餐',
    lunch: '午餐',
    dinner: '晚餐',
    snack: '小食',
  };
  return labels[type];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  content: {
    padding: 16,
  },
  captureSection: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  placeholder: {
    alignItems: 'center',
    marginBottom: 24,
  },
  placeholderText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  captureButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  captureButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  captureButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },
  secondaryButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
  previewSection: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 16,
  },
  resetButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTypeSection: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    ...TYPOGRAPHY.label,
    marginBottom: 12,
  },
  mealTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  mealTypeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.backgroundSecondary,
    alignItems: 'center',
  },
  mealTypeButtonSelected: {
    backgroundColor: COLORS.primary,
  },
  mealTypeButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
  },
  mealTypeButtonTextSelected: {
    color: COLORS.textInverse,
    fontWeight: '600',
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },
  resultSection: {
    backgroundColor: COLORS.background,
    borderRadius: 16,
    padding: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    ...TYPOGRAPHY.h3,
  },
  confidenceBadge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  confidenceText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '600',
  },
  portionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  nutritionItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nutritionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  nutritionLabel: {
    ...TYPOGRAPHY.caption,
    flex: 1,
  },
  nutritionValue: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  saveButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },
});
