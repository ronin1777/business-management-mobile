import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

export type ReportTab =
  | "sales"
  | "purchases"
  | "profitability"
  | "inventory"
  | "customers"
  | "suppliers";

type ReportTabsProps = {
  activeTab: ReportTab;
  onChange: (tab: ReportTab) => void;
};

type TabItem = {
  value: ReportTab;
  label: string;
};

const TABS: TabItem[] = [
  {
    value: "sales",
    label: "فروش",
  },
  {
    value: "purchases",
    label: "خرید",
  },
  {
    value: "profitability",
    label: "سودآوری",
  },
  {
    value: "inventory",
    label: "موجودی",
  },
  {
    value: "customers",
    label: "مشتریان",
  },
  {
    value: "suppliers",
    label: "تأمین‌کنندگان",
  },
];

export default function ReportTabs({
  activeTab,
  onChange,
}: ReportTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {TABS.map((tab) => {
        const isActive =
          activeTab === tab.value;

        return (
          <Pressable
            key={tab.value}
            onPress={() => onChange(tab.value)}
            style={[
              styles.tab,
              isActive && styles.activeTab,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                isActive && styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row-reverse",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },

  tab: {
    height: 38,
    paddingHorizontal: 14,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  activeTab: {
    backgroundColor: "#171717",
    borderColor: "#171717",
  },

  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#525252",
  },

  activeTabText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});