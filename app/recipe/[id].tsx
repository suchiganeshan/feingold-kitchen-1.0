import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";
import { useIngredients } from "@/contexts/IngredientsContext";

const c = Colors.light;

export default function RecipeDetailScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecipeById, deleteRecipe } = useIngredients();

  const recipe = getRecipeById(id);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 24 : insets.bottom + 24;

  if (!recipe) {
    return (
      <View style={[styles.container, { paddingTop: topPad }]}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={c.text} />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Ionicons name="document-outline" size={40} color={c.textTertiary} />
          <Text style={styles.notFoundText}>Recipe not found</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleDelete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    deleteRecipe(recipe.id);
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Pressable onPress={handleDelete} hitSlop={12} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={20} color={c.error} />
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad }]}
      >
        {/* Title block */}
        <View style={styles.titleBlock}>
          <View style={styles.leafBadge}>
            <Ionicons name="leaf" size={16} color={c.primary} />
            <Text style={styles.leafBadgeText}>Feingold Safe</Text>
          </View>
          <Text style={styles.title}>{recipe.title}</Text>
          <Text style={styles.description}>{recipe.description}</Text>
        </View>

        {/* Meta row */}
        <View style={styles.metaRow}>
          <View style={styles.metaCard}>
            <Ionicons name="time-outline" size={20} color={c.primary} />
            <Text style={styles.metaValue}>{recipe.prepTime}</Text>
            <Text style={styles.metaLabel}>Prep</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaCard}>
            <Ionicons name="flame-outline" size={20} color={c.accent} />
            <Text style={styles.metaValue}>{recipe.cookTime}</Text>
            <Text style={styles.metaLabel}>Cook</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaCard}>
            <Ionicons name="people-outline" size={20} color={c.primary} />
            <Text style={styles.metaValue}>{recipe.servings}</Text>
            <Text style={styles.metaLabel}>Servings</Text>
          </View>
        </View>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <View style={styles.tagRow}>
            {recipe.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Ingredients */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <Text style={styles.sectionCount}>{recipe.ingredients.length} items</Text>
          </View>
          <View style={styles.sectionCard}>
            {recipe.ingredients.map((ing, idx) => (
              <View key={idx} style={[styles.ingredientRow, idx < recipe.ingredients.length - 1 && styles.ingredientRowBorder]}>
                <View style={styles.bullet} />
                <Text style={styles.ingredientText}>{ing}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Steps */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            <Text style={styles.sectionCount}>{recipe.steps.length} steps</Text>
          </View>
          <View style={styles.stepsContainer}>
            {recipe.steps.map((step, idx) => (
              <View key={idx} style={styles.stepRow}>
                <View style={styles.stepNumWrap}>
                  <Text style={styles.stepNum}>{idx + 1}</Text>
                  {idx < recipe.steps.length - 1 && <View style={styles.stepLine} />}
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Ingredient credits */}
        {recipe.selectedIngredients && recipe.selectedIngredients.length > 0 && (
          <View style={styles.creditsCard}>
            <Text style={styles.creditsTitle}>Made with your selections</Text>
            <Text style={styles.creditsText}>
              {recipe.selectedIngredients.slice(0, 8).join(", ")}
              {recipe.selectedIngredients.length > 8 ? ` +${recipe.selectedIngredients.length - 8} more` : ""}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: c.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#FDF0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  notFoundText: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
    color: c.textSecondary,
  },
  backLink: { marginTop: 4 },
  backLinkText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: c.primary,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 4,
    gap: 20,
  },
  titleBlock: {
    gap: 10,
  },
  leafBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    backgroundColor: c.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.border,
  },
  leafBadgeText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: c.primary,
  },
  title: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: c.text,
    letterSpacing: -0.5,
    lineHeight: 32,
  },
  description: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: c.textSecondary,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: "row",
    backgroundColor: c.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: c.border,
    overflow: "hidden",
  },
  metaCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
  },
  metaValue: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    color: c.text,
  },
  metaLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: c.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaDivider: {
    width: 1,
    backgroundColor: c.border,
    marginVertical: 12,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: c.surfaceSecondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: c.border,
  },
  tagText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: c.primary,
  },
  section: { gap: 10 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Inter_600SemiBold",
    color: c.text,
  },
  sectionCount: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.textTertiary,
  },
  sectionCard: {
    backgroundColor: c.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: c.border,
    overflow: "hidden",
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ingredientRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: c.border,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: c.primary,
    marginTop: 7,
    flexShrink: 0,
  },
  ingredientText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: c.text,
    lineHeight: 22,
    flex: 1,
  },
  stepsContainer: { gap: 0 },
  stepRow: {
    flexDirection: "row",
    gap: 14,
  },
  stepNumWrap: {
    alignItems: "center",
    width: 28,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: c.primary,
    textAlign: "center",
    textAlignVertical: "center",
    lineHeight: 28,
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    overflow: "hidden",
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: c.border,
    marginTop: 4,
    marginBottom: -4,
    minHeight: 20,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 20,
    paddingTop: 4,
  },
  stepText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    color: c.text,
    lineHeight: 22,
  },
  creditsCard: {
    backgroundColor: c.surfaceSecondary,
    borderRadius: 14,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: c.border,
  },
  creditsTitle: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: c.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  creditsText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: c.textSecondary,
    lineHeight: 20,
  },
});
