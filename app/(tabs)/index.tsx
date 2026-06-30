import { useMemo } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Chip, Surface, Text, useThemeColor } from 'heroui-native';
import { CheckCircle2, ChevronRight, MapPin, Navigation, Trophy } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import MapView from '@/components/MapView';
import type { MapMarker } from '@/components/MapView';
import { LANDMARKS, rankForPoints } from '@/lib/data';
import { stampCount, useRallyStore } from '@/lib/store';
import { formatDistance } from '@/lib/utils';

export default function DashboardScreen() {
  const router = useRouter();
  const progress = useRallyStore((s) => s.progress);
  const triviaPoints = useRallyStore((s) => s.triviaPoints);

  const [accent, muted, success] = useThemeColor(['accent', 'muted', 'success']);

  const sorted = useMemo(() => [...LANDMARKS].sort((a, b) => a.distanceKm - b.distanceKm), []);
  const nearest = sorted[0];
  const stamps = stampCount(progress);
  const rank = rankForPoints(triviaPoints);

  const markers: MapMarker[] = useMemo(
    () =>
      sorted.map((l) => ({
        id: l.id,
        coordinate: { latitude: l.latitude, longitude: l.longitude },
        title: l.shortName,
        color: progress[l.id]?.stamped ? 'green' : 'blue',
      })),
    [sorted, progress],
  );

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="pb-10"
      showsVerticalScrollIndicator={false}
    >
      {/* Header summary */}
      <View className="px-5 pt-4">
        <Text className="text-foreground text-2xl font-bold">Tallinn Stamp Rally</Text>
        <Text className="text-muted mt-1 text-base">
          Visit landmarks, collect stamps, master the trivia.
        </Text>

        <View className="mt-4 flex-row gap-3">
          <Surface variant="secondary" className="flex-1 rounded-2xl p-4">
            <View className="flex-row items-center gap-2">
              <CheckCircle2 size={18} color={accent} />
              <Text className="text-muted text-sm">Stamps</Text>
            </View>
            <Text className="text-foreground mt-1 text-2xl font-bold">
              {stamps}
              <Text className="text-muted text-base"> / {LANDMARKS.length}</Text>
            </Text>
          </Surface>
          <Surface variant="secondary" className="flex-1 rounded-2xl p-4">
            <View className="flex-row items-center gap-2">
              <Trophy size={18} color={accent} />
              <Text className="text-muted text-sm">Trivia pts</Text>
            </View>
            <Text className="text-foreground mt-1 text-2xl font-bold">{triviaPoints}</Text>
            <Text className="text-muted text-xs" numberOfLines={1}>
              {rank.title}
            </Text>
          </Surface>
        </View>
      </View>

      {/* Map */}
      <View className="mt-5 px-5">
        <View className="border-border overflow-hidden rounded-2xl border">
          <MapView
            style={{ height: 200, width: '100%' }}
            initialRegion={{
              latitude: 59.4366,
              longitude: 24.7472,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            markers={markers}
            zoomLevel={14}
          />
        </View>
      </View>

      {/* Quick check-in */}
      {nearest && (
        <View className="mt-5 px-5">
          <Button
            variant="primary"
            size="lg"
            onPress={() => router.push({ pathname: '/landmark/[id]', params: { id: nearest.id } })}
          >
            <Navigation size={18} color="#FFFFFF" />
            <Button.Label>Quick check-in · {nearest.shortName}</Button.Label>
          </Button>
        </View>
      )}

      {/* Landmark list */}
      <View className="mt-6 px-5">
        <Text className="text-foreground mb-3 text-lg font-semibold">Nearby landmarks</Text>
        <View className="gap-3">
          {sorted.map((landmark, index) => {
            const stamped = progress[landmark.id]?.stamped ?? false;
            return (
              <Animated.View key={landmark.id} entering={FadeInDown.delay(index * 70).springify()}>
                <Pressable
                  onPress={() =>
                    router.push({ pathname: '/landmark/[id]', params: { id: landmark.id } })
                  }
                >
                  <Surface variant="default" className="rounded-2xl p-4">
                    <View className="flex-row items-center gap-3">
                      <View className="bg-accent-soft h-11 w-11 items-center justify-center rounded-full">
                        <MapPin size={20} color={accent} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-foreground text-base font-semibold" numberOfLines={1}>
                          {landmark.name}
                        </Text>
                        <View className="mt-0.5 flex-row items-center gap-1">
                          <Navigation size={12} color={muted} />
                          <Text className="text-muted text-xs">
                            {formatDistance(landmark.distanceKm)}
                          </Text>
                        </View>
                      </View>
                      {stamped ? (
                        <Chip color="success" size="sm">
                          <Chip.Label>Stamped</Chip.Label>
                        </Chip>
                      ) : (
                        <Chip color="default" variant="secondary" size="sm">
                          <Chip.Label>Unvisited</Chip.Label>
                        </Chip>
                      )}
                      <ChevronRight size={18} color={stamped ? success : muted} />
                    </View>
                  </Surface>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}
