import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { SymbolView } from "expo-symbols";
import { Platform, StyleSheet, useColorScheme, View } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/constants/colors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "leaf", selected: "leaf.fill" }} />
        <Label>Ingredients</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="recipes">
        <Icon sf={{ default: "book", selected: "book.fill" }} />
        <Label>Recipes</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const c = Colors.light;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: isDark ? "#111" : "#fff",
          }),
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: c.border,
          elevation: 0,
          height: 84,
          paddingBottom: 34,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 11,
          marginTop: 2,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={90}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Ingredients",
          tabBarIcon: ({ color, focused }) => (
            Platform.OS === "ios"
              ? <SymbolView name={focused ? "leaf.fill" : "leaf"} tintColor={color} size={24} />
              : <Ionicons name={focused ? "leaf" : "leaf-outline"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="recipes"
        options={{
          title: "Recipes",
          tabBarIcon: ({ color, focused }) => (
            Platform.OS === "ios"
              ? <SymbolView name={focused ? "book.fill" : "book"} tintColor={color} size={24} />
              : <Ionicons name={focused ? "book" : "book-outline"} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
