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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
} from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS, GRADIENTS } from '../../constants/colors';
import { TYPOGRAPHY, SPACING, RADIUS } from '../../constants/typography';
import { useUserStore } from '../../stores/userStore';
import { useFoodStore } from '../../stores/foodStore';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, Button, NutritionBadge } from '../../components/ui';
import { MealType, NutritionData } from '../../types';
import { analyzeFood as analyzeFoodAI } from '../../services/ai';

const { width } = Dimensions.get('window');

interface MealTypeConfig {
  type: MealType;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const MEAL_TYPES: MealTypeConfig[] = [
  { type: 'breakfast', labelKey: 'mealTypes.breakfast', icon: 'sunny', color: COLORS.calories },
  { type: 'lunch', labelKey: 'mealTypes.lunch', icon: 'partly-sunny', color: COLORS.carbs },
  { type: 'dinner', labelKey: 'mealTypes.dinner', icon: 'moon', color: COLORS.protein },
  { type: 'snack', labelKey: 'mealTypes.snack', icon: 'cafe', color: COLORS.fat },
];

export default function CameraScreen() {
  const { user } = useUserStore();
  const { addFoodLog } = useFoodStore();
  const { t } = useTranslation();

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
      // Get meal type label for context
      const mealTypeLabel = t(MEAL_TYPES.find((m) => m.type === selectedMealType)?.labelKey ?? 'mealTypes.lunch');
      
      // Call the AI service with Gemini
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
      Alert.alert(t('camera.recorded'), t('camera.recordedMessage', { food: analysisResult.food_name }));
      // Reset state
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
        <Animated.View entering={FadeIn} style={styles.captureSection}>
          <Card style={styles.captureCard} variant="elevated">
            <View style={styles.cameraPlaceholder}>
              <LinearGradient
                colors={[COLORS.primaryMuted, COLORS.successLight]}
                style={styles.placeholderGradient}
              >
                <View style={styles.placeholderIcon}>
                  <Ionicons name="camera" size={48} color={COLORS.primary} />
                </View>
              </LinearGradient>
              <Text style={styles.placeholderTitle}>{t('camera.placeholderTitle')}</Text>
              <Text style={styles.placeholderSubtitle}>
                {t('camera.placeholderSubtitle')}
              </Text>
            </View>

            <View style={styles.captureButtons}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={handleTakePhoto}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={GRADIENTS.primary}
                  style={styles.captureButtonGradient}
                >
                  <Ionicons name="camera" size={24} color={COLORS.textInverse} />
                  <Text style={styles.captureButtonText}>{t('camera.takePhoto')}</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.captureButton, styles.secondaryButton]}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                <View style={styles.secondaryButtonInner}>
                  <Ionicons name="images" size={24} color={COLORS.primary} />
                  <Text style={styles.secondaryButtonText}>{t('camera.choosePhoto')}</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>
      ) : (
        <Animated.View entering={FadeInDown.springify()}>
          <View style={styles.imagePreview}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.imageOverlay}
            />
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Ionicons name="close" size={20} color={COLORS.textInverse} />
            </TouchableOpacity>
            {analysisResult && (
              <View style={styles.confidenceBadge}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                <Text style={styles.confidenceText}>
                  {Math.round(analysisResult.confidence * 100)}% {t('camera.accuracy')}
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      )}

      {/* Meal Type Selection */}
      {imageUri && (
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <Card style={styles.mealTypeCard}>
            <Text style={styles.sectionLabel}>{t('camera.mealType')}</Text>
            <View style={styles.mealTypeGrid}>
              {MEAL_TYPES.map((meal, index) => (
                <Animated.View
                  key={meal.type}
                  entering={SlideInRight.delay(index * 50)}
                >
                  <TouchableOpacity
                    style={[
                      styles.mealTypeButton,
                      selectedMealType === meal.type && styles.mealTypeButtonSelected,
                      selectedMealType === meal.type && { borderColor: meal.color },
                    ]}
                    onPress={() => setSelectedMealType(meal.type)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.mealTypeIcon,
                        { backgroundColor: meal.color + '15' },
                        selectedMealType === meal.type && { backgroundColor: meal.color + '25' },
                      ]}
                    >
                      <Ionicons
                        name={meal.icon}
                        size={18}
                        color={meal.color}
                      />
                    </View>
                    <Text
                      style={[
                        styles.mealTypeLabel,
                        selectedMealType === meal.type && { color: meal.color, fontWeight: '600' },
                      ]}
                    >
                      {t(meal.labelKey)}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Card>
        </Animated.View>
      )}

      {/* Analyze Button */}
      {imageUri && !analysisResult && (
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <TouchableOpacity
            style={[styles.analyzeButton, isAnalyzing && styles.analyzeButtonDisabled]}
            onPress={handleAnalyze}
            disabled={isAnalyzing}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={isAnalyzing ? [COLORS.textMuted, COLORS.textTertiary] : GRADIENTS.primary}
              style={styles.analyzeButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isAnalyzing ? (
                <>
                  <ActivityIndicator color={COLORS.textInverse} size="small" />
                  <Text style={styles.analyzeButtonText}>{t('camera.analyzing')}</Text>
                </>
              ) : (
                <>
                  <Ionicons name="sparkles" size={22} color={COLORS.textInverse} />
                  <Text style={styles.analyzeButtonText}>{t('camera.analyzeButton')}</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Analysis Result */}
      {analysisResult && (
        <Animated.View entering={FadeInUp.delay(100).springify()}>
          <Card style={styles.resultCard} variant="elevated">
            {/* Food Name Header */}
            <View style={styles.resultHeader}>
              <View style={styles.resultTitleRow}>
                <View style={styles.resultIconContainer}>
                  <Ionicons name="restaurant" size={20} color={COLORS.primary} />
                </View>
                <View>
                  <Text style={styles.resultTitle}>{analysisResult.food_name}</Text>
                  <Text style={styles.resultPortion}>
                    {t('camera.estimatedPortion')}: {analysisResult.portion_size_grams}g
                  </Text>
                </View>
              </View>
            </View>

            {/* Calories Highlight */}
            <View style={styles.caloriesHighlight}>
              <View style={styles.caloriesLeft}>
                <Text style={styles.caloriesLabel}>{t('camera.totalCalories')}</Text>
                <View style={styles.caloriesValueRow}>
                  <Text style={styles.caloriesValue}>
                    {Math.round(analysisResult.nutrition.calories)}
                  </Text>
                  <Text style={styles.caloriesUnit}>{t('units.kcal')}</Text>
                </View>
              </View>
              <View style={styles.caloriesIcon}>
                <Ionicons name="flame" size={28} color={COLORS.calories} />
              </View>
            </View>

            {/* Nutrition Grid */}
            <View style={styles.nutritionGrid}>
              <NutritionBadge
                type="protein"
                value={analysisResult.nutrition.protein}
                max={100}
                variant="compact"
                style={styles.nutritionCompact}
              />
              <NutritionBadge
                type="carbs"
                value={analysisResult.nutrition.carbs}
                max={100}
                variant="compact"
                style={styles.nutritionCompact}
              />
              <NutritionBadge
                type="fat"
                value={analysisResult.nutrition.fat}
                max={100}
                variant="compact"
                style={styles.nutritionCompact}
              />
              <NutritionBadge
                type="fiber"
                value={analysisResult.nutrition.fiber}
                max={30}
                variant="compact"
                style={styles.nutritionCompact}
              />
            </View>

            {/* Save Button */}
            <Button
              title={t('camera.recordMeal')}
              icon="checkmark-circle"
              onPress={handleSave}
              gradient
              fullWidth
              size="lg"
              style={styles.saveButton}
            />
          </Card>
        </Animated.View>
      )}

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

  // Capture Section
  captureSection: {
    marginBottom: SPACING.lg,
  },
  captureCard: {
    padding: 0,
    overflow: 'hidden',
  },
  cameraPlaceholder: {
    alignItems: 'center',
    paddingVertical: SPACING['3xl'],
    paddingHorizontal: SPACING.lg,
  },
  placeholderGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  placeholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  placeholderTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  placeholderSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  captureButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundSecondary,
  },
  captureButton: {
    flex: 1,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  captureButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.colored(COLORS.primary),
  },
  captureButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.textInverse,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  secondaryButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.primary,
  },

  // Image Preview
  imagePreview: {
    position: 'relative',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },
  previewImage: {
    width: '100%',
    aspectRatio: 4 / 3,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  resetButton: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confidenceBadge: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: SPACING.xs,
  },
  confidenceText: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.success,
  },

  // Meal Type
  mealTypeCard: {
    marginBottom: SPACING.lg,
  },
  sectionLabel: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealTypeGrid: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  mealTypeButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.backgroundSecondary,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: (width - SPACING.lg * 2 - SPACING.lg * 2 - SPACING.sm * 3) / 4,
  },
  mealTypeButtonSelected: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  mealTypeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xs,
  },
  mealTypeLabel: {
    ...TYPOGRAPHY.captionMedium,
    color: COLORS.textSecondary,
  },

  // Analyze Button
  analyzeButton: {
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.colored(COLORS.primary),
  },
  analyzeButtonDisabled: {
    ...SHADOWS.sm,
  },
  analyzeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.lg,
    gap: SPACING.sm,
  },
  analyzeButtonText: {
    ...TYPOGRAPHY.buttonLarge,
    color: COLORS.textInverse,
  },

  // Result Card
  resultCard: {
    padding: SPACING.lg,
  },
  resultHeader: {
    marginBottom: SPACING.lg,
  },
  resultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultIconContainer: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  resultTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  resultPortion: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // Calories Highlight
  caloriesHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.caloriesBg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
  },
  caloriesLeft: {
    flex: 1,
  },
  caloriesLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  caloriesValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: '800',
    color: COLORS.calories,
    letterSpacing: -1,
  },
  caloriesUnit: {
    ...TYPOGRAPHY.body,
    color: COLORS.calories,
    marginLeft: SPACING.xs,
    fontWeight: '500',
  },
  caloriesIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.calories + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Nutrition Grid
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.xl,
  },
  nutritionCompact: {
    flex: 1,
  },

  // Save Button
  saveButton: {
    marginTop: SPACING.sm,
  },

  // Bottom spacer
  bottomSpacer: {
    height: SPACING['2xl'],
  },
});
