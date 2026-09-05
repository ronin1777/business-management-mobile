
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Slot } from "expo-router";

import { AppDrawer } from "@/components/layout/AppDrawer";
import { AppHeader } from "@/components/layout/AppHeader";

export default function DashboardLayout() {
  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const translateX = useSharedValue(280);

  function openDrawer() {
    setDrawerOpen(true);

    translateX.value = withTiming(0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }

  function closeDrawer() {
    translateX.value = withTiming(280, {
      duration: 260,
      easing: Easing.in(Easing.cubic),
    });

    setDrawerOpen(false);
  }

  function toggleDrawer() {
    if (drawerOpen) {
      closeDrawer();
    } else {
      openDrawer();
    }
  }

  const drawerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: translateX.value,
        },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <AppHeader
          onMenuPress={toggleDrawer}
          drawerOpen={drawerOpen}
        />

        <View style={styles.screen}>
          <Slot />
        </View>
      </View>

      {drawerOpen && (
        <Pressable
          style={styles.overlay}
          onPress={closeDrawer}
        />
      )}

      <Animated.View
        pointerEvents={
          drawerOpen ? "auto" : "none"
        }
        style={[
          styles.drawer,
          drawerStyle,
        ]}
      >
        <AppDrawer
          onClose={closeDrawer}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },

  content: {
    flex: 1,
    zIndex: 100,
  },

  screen: {
    flex: 1,
  },

  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
    zIndex: 200,
  },

  drawer: {
  position: "absolute",
  top: 16,
  bottom: 16,
  right: 12,
  width: 280,
  backgroundColor: "#ffffff",
  borderRadius: 20,
  zIndex: 300,
  elevation: 30,
  shadowColor: "#000000",
  shadowOffset: {
    width: -4,
    height: 0,
  },
  shadowOpacity: 0.16,
  shadowRadius: 14,
  overflow: "hidden",
},
});

