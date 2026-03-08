import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  FadeInDown,
} from "react-native-reanimated";
import Colors from "@/constants/colors";
import { useIngredients, Recipe } from "@/contexts/IngredientsContext";
import { INGREDIENT_CATEGORIES } from "@/constants/ingredients";
import { getApiUrl } from "@/lib/query-client";
import { fetch } from "expo/fetch";

const c = Colors.light;

function PulsingDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      )
    );
  }, [delay]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.dot, style]} />;
}

function RecipeCard({ recipe, index, onView }: {
  recipe: Recipe;
  index: number;
  onView: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(index * 120).springify()}>
      <Pressable
        onPress={onView}
        style={({ pressed }) => [styles.recipeCard, { opacity: pressed ? 0.92 : 1 }]}
      >
        <View style={styles.recipeCardHeader}>
          <View style={styles.recipeNum}>
            <Text style={styles.recipeNumText}>{index + 1}</Text>
          </View>
          <View style={styles.recipeCardTitles}>
            <Text style={styles.recipeTitle}>{recipe.title}</Text>
            <Text style={styles.recipeDesc} numberOfLines={2}>{recipe.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={c.textTertiary} />
        </View>

        <View style={styles.recipeMetaRow}>
          <View style={styles.metaChip}>
            <Ionicons name="time-outline" size={12} color={c.primary} />
            <Text style={styles.metaChipText}>{recipe.prepTime}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="flame-outline" size={12} color={c.primary} />
            <Text style={styles.metaChipText}>{recipe.cookTime}</Text>
          </View>
          <View style={styles.metaChip}>
            <Ionicons name="people-outline" size={12} color={c.primary} />
            <Text style={styles.metaChipText}>Serves {recipe.servings}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function GenerateScreen() {
  const insets = useSafeAreaInsets();
  const { selectedIds, saveRecipes } = useIngredients();
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const hasStarted = useRef(false);

  const selectedNames = Array.from(selectedIds)
    .map((id) => {
      for (const cat of INGREDIENT_CATEGORIES) {
        const ing = cat.ingredients.find((i) => i.id === id);
        if (ing) return ing.name;
      }
      return null;
    })
    .filter(Boolean) as string[];

  useEffect(() => {
    if (!hasStarted.current && selectedIds.size > 0) {
      hasStarted.current = true;
      generateRecipes();
    }
  }, []);

  const generateRecipes = async () => {
    setStatus("loading");
    setRecipes([]);
    setErrorMsg("");

    try {
      const baseUrl = getApiUrl();
      const url = new URL("/api/generate-recipes", baseUrl);

      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: selectedNames }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No stream available");

      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (!payload) continue;
          try {
            const parsed = JSON.parse(payload);
            if (parsed.chunk) fullText += parsed.chunk;
            if (parsed.done && parsed.fullText) fullText = parsed.fullText;
          } catch {}
        }
      }

      const jsonMatch = fullText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("No valid JSON in response");
      const parsed = JSON.parse(jsonMatch[0]);

      const withIds = await saveRecipes(parsed, selectedNames);
      setRecipes(withIds);
      setStatus("done");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err: any) {
      console.error("Generation error:", err);
      setErrorMsg(err.message || "Something went wrong");
      setStatus("error");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 16 : insets.bottom + 16;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </Pressable>
        <Text style={styles.headerTitle}>
          {status === "loading" ? "Creating recipes..." : "Your Recipes"}
        </Text>
        {status === "done" ? (
          <Pressable onPress={generateRecipes} hitSlop={8} style={styles.iconBtn}>
            <Ionicons name="refresh" size={20} color={c.primary} />
          </Pressable>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Selected ingredient pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillScroll}
        contentContainerStyle={styles.pillContent}
      >
        {selectedNames.slice(0, 14).map((name) => (
          <View key={name} style={styles.pill}>
            <Text style={styles.pillText}>{name}</Text>
          </View>
        ))}
        {selectedNames.length > 14 && (
          <View style={styles.pill}>
            <Text style={styles.pillText}>+{selectedNames.length - 14}</Text>
          </View>
        )}
      </ScrollView>

      {status === "loading" && (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <View style={styles.leafIcon}>
              <Ionicons name="leaf" size={28} color={c.primary} />
            </View>
            <View style={styles.dotsRow}>
              <PulsingDot delay={0} />
              <PulsingDot delay={180} />
              <PulsingDot delay={360} />
            </View>
            <Text style={styles.loadingTitle}>Crafting your recipes</Text>
            <Text style={styles.loadingSubtitle}>
              Combining {selectedNames.length} Feingold-approved ingredients into delicious dishes...
            </Text>
          </View>
        </View>
      )}

      {status === "error" && (
        <View style={styles.centerContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle-outline" size={36} color={c.error} />
          </View>
          <Text style={styles.errorTitle}>Generation failed</Text>
          <Text style={styles.errorMsg}>{errorMsg}</Text>
          <Pressable
            onPress={generateRecipes}
            style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Ionicons name="refresh" size={16} color="#fff" />
            <Text style={styles.actionBtnText}>Try Again</Text>
          </Pressable>
        </View>
      )}

      {status === "done" && (
        <ScrollView
          contentContainerStyle={[styles.resultsContent, { paddingBottom: bottomPad }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>3 Feingold-safe recipes</Text>
          {recipes.map((recipe, index) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              index={index}
              onView={() =>
                router.push({
                  pathname: "/recipe/[id]",
                  params: { id: recipe.id },
                })
              }
            />
          ))}
          <Pressable
            onPress={() => router.push("/(tabs)/recipes")}
            style={({ pressed }) => [styles.viewAllBtn, { opacity: pressed ? 0.85 : 1 }]}
          >
            <Ionicons name="book-outline" size={16} color={c.primary} />
            <Text style={styles.viewAllText}>View saved recipe collection</Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: c.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: c.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: c.text,
    flex: 1,
    textAlign: "center",
  },
  pillScroll: { maxHeight: 40, flexGrow: 0 },
  pillContent: {
    paddingHorizontal: 16,
    gap: 6,
    alignItems: "center",
  },
  pill: {
    backgroundColor: c.accentLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D5BC",
  },
  pillText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: c.accent,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  loadingCard: {
    backgroundColor: c.surface,
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    gap: 14,
    width: "100%",
    borderWidth: 1,
    borderColor: c.border,
  },
  leafIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: c.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  dotsRow: { flexDirection: "row", gap: 8 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: c.primary,
  },
  loadingTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    color: c.text,
  },
  loadingSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: c.textSecondary,
    textAlign: "center",
    lineHeight: 21,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  errorIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: "#FDF0F0",
    alignItems: "center",
    justifyContent: "center",
  },
  errorTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    color: c.text,
  },
  errorMsg: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: c.textSecondary,
    textAlign: "center",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: c.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 4,
  },
  actionBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  resultsContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: c.textTertiary,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  recipeCard: {
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: c.border,
    gap: 12,
  },
  recipeCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  recipeNum: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: c.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  recipeNumText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
    color: c.primary,
  },
  recipeCardTitles: { flex: 1, gap: 2 },
  recipeTitle: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: c.text,
  },
  recipeDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.textSecondary,
    lineHeight: 18,
  },
  recipeMetaRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: c.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  metaChipText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: c.primary,
  },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: c.border,
    marginTop: 4,
  },
  viewAllText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    color: c.primary,
  },
});
