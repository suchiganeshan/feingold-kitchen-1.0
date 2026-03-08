import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  ReactNode,
  useCallback,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Stage = 1 | 2;

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: string[];
  steps: string[];
  tags: string[];
  savedAt: number;
  selectedIngredients: string[];
}

interface IngredientsContextValue {
  selectedIds: Set<string>;
  toggleIngredient: (id: string) => void;
  clearAll: () => void;
  stage: Stage;
  setStage: (stage: Stage) => void;
  savedRecipes: Recipe[];
  saveRecipes: (recipes: Omit<Recipe, "id" | "savedAt" | "selectedIngredients">[], selectedIngredients: string[]) => Promise<Recipe[]>;
  deleteRecipe: (id: string) => Promise<void>;
  loadSavedRecipes: () => Promise<void>;
  getRecipeById: (id: string) => Recipe | undefined;
}

const IngredientsContext = createContext<IngredientsContextValue | null>(null);

const STORAGE_KEY = "feingold_saved_recipes";

export function IngredientsProvider({ children }: { children: ReactNode }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [stage, setStageState] = useState<Stage>(1);

  const toggleIngredient = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const setStage = useCallback((newStage: Stage) => {
    setStageState(newStage);
    // Clear any selected ingredients that are not allowed in the new stage
    if (newStage === 1) {
      setSelectedIds((prev) => {
        // We'll filter in the screen based on stage, but also clear from selection
        return new Set(prev);
      });
    }
  }, []);

  const loadSavedRecipes = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSavedRecipes(JSON.parse(raw));
      }
    } catch (e) {
      console.error("Failed to load recipes", e);
    }
  }, []);

  const saveRecipes = useCallback(
    async (
      recipes: Omit<Recipe, "id" | "savedAt" | "selectedIngredients">[],
      selectedIngredients: string[]
    ): Promise<Recipe[]> => {
      const withMeta: Recipe[] = recipes.map((r) => ({
        ...r,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        savedAt: Date.now(),
        selectedIngredients,
      }));
      setSavedRecipes((prev) => {
        const next = [...withMeta, ...prev].slice(0, 20);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        return next;
      });
      return withMeta;
    },
    []
  );

  const deleteRecipe = useCallback(async (id: string) => {
    setSavedRecipes((prev) => {
      const next = prev.filter((r) => r.id !== id);
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const getRecipeById = useCallback(
    (id: string) => savedRecipes.find((r) => r.id === id),
    [savedRecipes]
  );

  const value = useMemo(
    () => ({
      selectedIds,
      toggleIngredient,
      clearAll,
      stage,
      setStage,
      savedRecipes,
      saveRecipes,
      deleteRecipe,
      loadSavedRecipes,
      getRecipeById,
    }),
    [
      selectedIds,
      toggleIngredient,
      clearAll,
      stage,
      setStage,
      savedRecipes,
      saveRecipes,
      deleteRecipe,
      loadSavedRecipes,
      getRecipeById,
    ]
  );

  return (
    <IngredientsContext.Provider value={value}>
      {children}
    </IngredientsContext.Provider>
  );
}

export function useIngredients() {
  const ctx = useContext(IngredientsContext);
  if (!ctx) throw new Error("useIngredients must be used within IngredientsProvider");
  return ctx;
}
