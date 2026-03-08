import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { INGREDIENT_CATEGORIES, Ingredient } from "@/constants/ingredients";
import { useIngredients, Stage } from "@/contexts/IngredientsContext";

const c = Colors.light;

function IngredientChip({ ingredient, selected, onToggle }: {
  ingredient: Ingredient;
  selected: boolean;
  onToggle: () => void;
}) {
  const scale = useSharedValue(1);
  const progress = useSharedValue(selected ? 1 : 0);

  React.useEffect(() => {
    progress.value = withSpring(selected ? 1 : 0, { damping: 15, stiffness: 200 });
  }, [selected]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [c.chip, c.chipSelected]
    ),
    borderColor: interpolateColor(
      progress.value,
      [0, 1],
      [c.border, c.primary]
    ),
  }));

  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(
      progress.value,
      [0, 1],
      [c.chipText, c.chipTextSelected]
    ),
  }));

  const handlePress = () => {
    scale.value = withSpring(0.92, { damping: 12 }, () => {
      scale.value = withSpring(1, { damping: 12 });
    });
    Haptics.selectionAsync();
    onToggle();
  };

  return (
    <Pressable onPress={handlePress} hitSlop={4}>
      <Animated.View style={[styles.chip, animStyle]}>
        <Animated.Text style={[styles.chipText, textStyle]}>
          {ingredient.name}
        </Animated.Text>
        {selected && (
          <Ionicons name="checkmark" size={13} color="#fff" style={{ marginLeft: 4 }} />
        )}
      </Animated.View>
    </Pressable>
  );
}

function StagePill({ label, active, onPress }: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.stagePill, active && styles.stagePillActive]}
    >
      <Text style={[styles.stagePillText, active && styles.stagePillTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export default function IngredientsScreen() {
  const insets = useSafeAreaInsets();
  const { selectedIds, toggleIngredient, clearAll, stage, setStage } = useIngredients();
  const [activeCategory, setActiveCategory] = useState(INGREDIENT_CATEGORIES[0].id);
  const count = selectedIds.size;

  const activeCategory_ = INGREDIENT_CATEGORIES.find(c => c.id === activeCategory)!;

  // Filter ingredients by current stage
  const visibleIngredients = activeCategory_.ingredients.filter(
    (ing) => ing.stage <= stage
  );

  const handleStageChange = (newStage: Stage) => {
    Haptics.selectionAsync();
    setStage(newStage);
    // If switching to Stage 1, deselect any Stage 2 only ingredients
    if (newStage === 1) {
      INGREDIENT_CATEGORIES.forEach((cat) => {
        cat.ingredients.forEach((ing) => {
          if (ing.stage === 2 && selectedIds.has(ing.id)) {
            toggleIngredient(ing.id);
          }
        });
      });
    }
  };

  const handleGenerate = () => {
    if (count === 0) return;
    router.push("/generate");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : 84 + 16;

  // Check if current category has any visible ingredients
  const categoryHasItems = (catId: string) => {
    const cat = INGREDIENT_CATEGORIES.find(c => c.id === catId)!;
    return cat.ingredients.some(ing => ing.stage <= stage);
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Ingredients</Text>
          <Text style={styles.headerSubtitle}>Select what you have on hand</Text>
        </View>
        {count > 0 && (
          <Pressable onPress={clearAll} hitSlop={8}>
            <Text style={styles.clearText}>Clear all</Text>
          </Pressable>
        )}
      </View>

      {/* Stage Toggle */}
      <View style={styles.stageContainer}>
        <View style={styles.stageLabelRow}>
          <Ionicons name="information-circle-outline" size={14} color={c.textTertiary} />
          <Text style={styles.stageLabel}>Feingold Stage</Text>
        </View>
        <View style={styles.stagePills}>
          <StagePill
            label="Stage 1"
            active={stage === 1}
            onPress={() => handleStageChange(1)}
          />
          <StagePill
            label="Stage 2"
            active={stage === 2}
            onPress={() => handleStageChange(2)}
          />
        </View>
        <Text style={styles.stageHint}>
          {stage === 1
            ? "Stage 1: No fruits or salicylate foods — strictest phase"
            : "Stage 2: Fruits and additional foods unlocked"}
        </Text>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContent}
      >
        {INGREDIENT_CATEGORIES.filter(cat => categoryHasItems(cat.id)).map((cat) => {
          const isActive = cat.id === activeCategory;
          return (
            <Pressable
              key={cat.id}
              onPress={() => {
                setActiveCategory(cat.id);
                Haptics.selectionAsync();
              }}
              style={[styles.categoryTab, isActive && styles.categoryTabActive]}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                {cat.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Ingredient chips */}
      <ScrollView
        style={styles.ingredientScroll}
        contentContainerStyle={[styles.ingredientContent, { paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        {visibleIngredients.length === 0 ? (
          <View style={styles.emptyCategory}>
            <Text style={styles.emptyCategoryText}>
              No ingredients available in Stage 1 for this category.
            </Text>
            <Text style={styles.emptyCategoryHint}>
              Switch to Stage 2 to unlock these foods.
            </Text>
          </View>
        ) : (
          <View style={styles.chipsWrap}>
            {visibleIngredients.map((ingredient) => (
              <IngredientChip
                key={ingredient.id}
                ingredient={ingredient}
                selected={selectedIds.has(ingredient.id)}
                onToggle={() => toggleIngredient(ingredient.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Generate button */}
      {count > 0 && (
        <View style={[styles.generateWrap, { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84 + 8 }]}>
          <Pressable
            onPress={handleGenerate}
            style={({ pressed }) => [styles.generateBtn, { opacity: pressed ? 0.88 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] }]}
          >
            <Ionicons name="sparkles" size={18} color="#fff" />
            <Text style={styles.generateText}>
              Generate Recipes · {count} ingredient{count !== 1 ? "s" : ""}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: c.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    color: c.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: c.textSecondary,
    marginTop: 2,
  },
  clearText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: c.accent,
    marginTop: 6,
  },
  // Stage toggle styles
  stageContainer: {
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: c.surfaceSecondary,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  stageLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  stageLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: c.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stagePills: {
    flexDirection: "row",
    gap: 8,
  },
  stagePill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: c.surface,
    borderWidth: 1.5,
    borderColor: c.border,
  },
  stagePillActive: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  stagePillText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: c.textSecondary,
  },
  stagePillTextActive: {
    color: "#fff",
  },
  stageHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.textTertiary,
    lineHeight: 17,
  },
  categoryScroll: {
    maxHeight: 60,
    flexGrow: 0,
  },
  categoryContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: "center",
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: c.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  categoryTabActive: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  categoryEmoji: {
    fontSize: 15,
  },
  categoryText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.textSecondary,
  },
  categoryTextActive: {
    color: "#fff",
  },
  ingredientScroll: {
    flex: 1,
    marginTop: 12,
  },
  ingredientContent: {
    paddingHorizontal: 16,
  },
  chipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  emptyCategory: {
    paddingVertical: 32,
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  emptyCategoryText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: c.textSecondary,
    textAlign: "center",
  },
  emptyCategoryHint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.textTertiary,
    textAlign: "center",
  },
  generateWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  generateBtn: {
    backgroundColor: c.primary,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
    shadowColor: c.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  generateText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
});
