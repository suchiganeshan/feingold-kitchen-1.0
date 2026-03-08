import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Platform,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Colors from "@/constants/colors";
import { useIngredients, Recipe } from "@/contexts/IngredientsContext";

const c = Colors.light;

function RecipeCard({ recipe, onDelete }: { recipe: Recipe; onDelete: () => void }) {
  const handleDelete = () => {
    Alert.alert("Delete Recipe", "Remove this recipe from your collection?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          onDelete();
        },
      },
    ]);
  };

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/recipe/[id]", params: { id: recipe.id } })}
      style={({ pressed }) => [styles.card, { opacity: pressed ? 0.92 : 1 }]}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={styles.cardTitle} numberOfLines={2}>{recipe.title}</Text>
          <Text style={styles.cardDesc} numberOfLines={2}>{recipe.description}</Text>
        </View>
        <Pressable onPress={handleDelete} hitSlop={10} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color={c.textTertiary} />
        </Pressable>
      </View>

      <View style={styles.cardMeta}>
        <View style={styles.metaItem}>
          <Ionicons name="time-outline" size={13} color={c.textTertiary} />
          <Text style={styles.metaText}>{recipe.prepTime} prep</Text>
        </View>
        <View style={styles.metaDot} />
        <View style={styles.metaItem}>
          <Ionicons name="flame-outline" size={13} color={c.textTertiary} />
          <Text style={styles.metaText}>{recipe.cookTime} cook</Text>
        </View>
        <View style={styles.metaDot} />
        <View style={styles.metaItem}>
          <Ionicons name="people-outline" size={13} color={c.textTertiary} />
          <Text style={styles.metaText}>Serves {recipe.servings}</Text>
        </View>
      </View>

      <View style={styles.tagRow}>
        {recipe.tags.slice(0, 3).map((tag) => (
          <View key={tag} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

export default function RecipesScreen() {
  const insets = useSafeAreaInsets();
  const { savedRecipes, deleteRecipe, loadSavedRecipes, selectedIds } = useIngredients();
  const count = selectedIds.size;

  useEffect(() => {
    loadSavedRecipes();
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 84 : insets.bottom + 84 + 16;

  return (
    <View style={[styles.container, { paddingTop: topPad }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recipes</Text>
        <Text style={styles.headerSubtitle}>Your generated collection</Text>
      </View>

      {savedRecipes.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="book-outline" size={40} color={c.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No recipes yet</Text>
          <Text style={styles.emptyText}>
            Select ingredients on the Ingredients tab and generate your first Feingold-safe recipes
          </Text>
          {count > 0 && (
            <Pressable
              onPress={() => router.push("/generate")}
              style={({ pressed }) => [styles.emptyBtn, { opacity: pressed ? 0.85 : 1 }]}
            >
              <Ionicons name="sparkles" size={15} color="#fff" />
              <Text style={styles.emptyBtnText}>Generate Now</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={savedRecipes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RecipeCard recipe={item} onDelete={() => deleteRecipe(item.id)} />
          )}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: bottomPad, paddingTop: 4 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
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
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: c.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    color: c.text,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: c.textSecondary,
    textAlign: "center",
    lineHeight: 21,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: c.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  card: {
    backgroundColor: c.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: c.border,
    gap: 10,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 12,
  },
  cardHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: c.text,
    lineHeight: 22,
  },
  cardDesc: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: c.textSecondary,
    lineHeight: 18,
  },
  deleteBtn: {
    padding: 4,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: c.textTertiary,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: c.border,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    backgroundColor: c.surfaceSecondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    color: c.primary,
  },
});
