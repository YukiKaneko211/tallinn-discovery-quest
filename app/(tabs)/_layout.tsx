import { MapPin, Image as ImageIcon, BookMarked } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from 'heroui-native';
import { useUniwind } from 'uniwind';

export default function TabLayout() {
  const { theme } = useUniwind();
  const [background, foreground, border, accent, muted] = useThemeColor([
    'background',
    'foreground',
    'border',
    'accent',
    'muted',
  ]);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: background },
          headerTintColor: foreground,
          headerTitleStyle: { color: foreground, fontFamily: 'Inter_700Bold' },
          headerShadowVisible: false,
          sceneStyle: { backgroundColor: background },
          tabBarStyle: {
            backgroundColor: background,
            borderTopColor: border,
          },
          tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
          tabBarActiveTintColor: accent,
          tabBarInactiveTintColor: muted,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, size }) => <MapPin color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="souvenir"
          options={{
            title: 'Souvenir',
            tabBarIcon: ({ color, size }) => <ImageIcon color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="passport"
          options={{
            title: 'Passport',
            tabBarIcon: ({ color, size }) => <BookMarked color={color} size={size ?? 24} />,
          }}
        />
      </Tabs>
    </>
  );
}
