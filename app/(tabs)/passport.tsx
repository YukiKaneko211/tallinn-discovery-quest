import { useMemo } from 'react';
import { ScrollView, View } from 'react-native';
import { Button, Surface, Text, useThemeColor } from 'heroui-native';
import { Award, Lock, RotateCcw, Star, Trophy } from 'lucide-react-native';

import { StampImage } from '@/components/StampImage';
import { FRAMES, LANDMARKS, nextRank, rankForPoints } from '@/lib/data';
import { isFrameUnlocked, stampCount, useRallyStore } from '@/lib/store';

export default function PassportScreen() {
  const progress = useRallyStore((s) => s.progress);
  const triviaPoints = useRallyStore((s) => s.triviaPoints);
  const reset = useRallyStore((s) => s.reset);

  const [accent, muted, gold, success] = useThemeColor(['accent', 'muted', 'warning', 'success']);

  const stamps = stampCount(progress);
  const rank = rankForPoints(triviaPoints);
  const upcoming = nextRank(triviaPoints);

  const progressToNext = useMemo(() => {
    if (!upcoming) return 1;
    const span = upcoming.minPoints - rank.minPoints;
    if (span <= 0) return 1;
    return Math.min(1, (triviaPoints - rank.minPoints) / span);
  }, [upcoming, rank, triviaPoints]);

  const unlockedFrames = FRAMES.filter((f) => isFrameUnlocked(f, stamps, triviaPoints)).length;

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="pb-12 px-5 pt-4"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-foreground text-2xl font-bold">Stamp Passport</Text>
      <Text className="text-muted mt-1 text-base">Your Tallinn rally progress.</Text>

      {/* Rank card */}
      <Surface variant="secondary" className="mt-5 rounded-2xl p-5">
        <View className="flex-row items-center gap-3">
          <View className="bg-accent-soft h-12 w-12 items-center justify-center rounded-full">
            <Trophy size={24} color={accent} />
          </View>
          <View className="flex-1">
            <Text className="text-muted text-xs tracking-wide uppercase">Quiz Master Rank</Text>
            <Text className="text-foreground text-lg font-bold">{rank.title}</Text>
          </View>
          <View className="items-end">
            <Text className="text-2xl font-bold" style={{ color: accent }}>
              {triviaPoints}
            </Text>
            <Text className="text-muted text-xs">trivia pts</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View className="bg-default mt-4 h-2.5 overflow-hidden rounded-full">
          <View
            className="h-full rounded-full"
            style={{ backgroundColor: accent, width: `${progressToNext * 100}%` }}
          />
        </View>
        <Text className="text-muted mt-2 text-xs">
          {upcoming
            ? `${upcoming.minPoints - triviaPoints} pts to ${upcoming.title}`
            : 'Top rank reached — you are a true Quiz Master!'}
        </Text>
      </Surface>

      {/* Quick stats */}
      <View className="mt-4 flex-row gap-3">
        <Surface variant="secondary" className="flex-1 items-center rounded-2xl p-4">
          <Star size={20} color={accent} />
          <Text className="text-foreground mt-1 text-2xl font-bold">
            {stamps}/{LANDMARKS.length}
          </Text>
          <Text className="text-muted text-xs">Stamps</Text>
        </Surface>
        <Surface variant="secondary" className="flex-1 items-center rounded-2xl p-4">
          <Award size={20} color={gold} />
          <Text className="text-foreground mt-1 text-2xl font-bold">
            {unlockedFrames}/{FRAMES.length}
          </Text>
          <Text className="text-muted text-xs">Frames</Text>
        </Surface>
      </View>

      {/* Stamp gallery */}
      <Text className="text-foreground mt-7 mb-3 text-lg font-semibold">Collected stamps</Text>
      <View className="flex-row flex-wrap" style={{ gap: 12 }}>
        {LANDMARKS.map((landmark) => {
          const stamped = progress[landmark.id]?.stamped ?? false;
          const correct = progress[landmark.id]?.triviaCorrect ?? false;
          return (
            <Surface
              key={landmark.id}
              variant="secondary"
              className="items-center rounded-2xl p-3"
              style={{ width: '47.5%' }}
            >
              <View style={{ opacity: stamped ? 1 : 0.35 }}>
                <StampImage stamped={stamped} size={110} />
              </View>
              <Text
                className="text-foreground mt-1 text-center text-sm font-semibold"
                numberOfLines={1}
              >
                {landmark.shortName}
              </Text>
              <Text className="text-muted text-xs">
                {stamped ? (correct ? 'Trivia solved' : 'Stamped') : 'Not visited'}
              </Text>
            </Surface>
          );
        })}
      </View>

      {/* Frame catalog */}
      <Text className="text-foreground mt-7 mb-3 text-lg font-semibold">Reward frames</Text>
      <View className="gap-3">
        {FRAMES.map((frame) => {
          const unlocked = isFrameUnlocked(frame, stamps, triviaPoints);
          return (
            <Surface
              key={frame.id}
              variant="secondary"
              className="flex-row items-center gap-3 rounded-2xl p-3"
            >
              <View
                className="h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: frame.color + '22', opacity: unlocked ? 1 : 0.5 }}
              >
                {unlocked ? (
                  <View
                    className="h-6 w-6 rounded-md"
                    style={{ borderWidth: 3, borderColor: frame.color }}
                  />
                ) : (
                  <Lock size={16} color={muted} />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-foreground text-base font-semibold">{frame.name}</Text>
                <Text className="text-muted text-xs" numberOfLines={2}>
                  {frame.description}
                </Text>
              </View>
              <Text className="text-xs font-semibold" style={{ color: unlocked ? success : muted }}>
                {unlocked ? 'Unlocked' : 'Locked'}
              </Text>
            </Surface>
          );
        })}
      </View>

      {/* Reset (demo helper) */}
      <Button variant="ghost" className="mt-7" onPress={() => reset()}>
        <RotateCcw size={16} color={muted} />
        <Button.Label>Reset rally progress</Button.Label>
      </Button>
    </ScrollView>
  );
}
