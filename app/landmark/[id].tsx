import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  Button,
  Description,
  FieldError,
  Input,
  Label,
  Surface,
  Text,
  TextField,
  useThemeColor,
} from 'heroui-native';
import { CheckCircle2, HelpCircle, Lightbulb, Lock, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  createAnimatedComponent,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { StampImage } from '@/components/StampImage';
import { LANDMARKS } from '@/lib/data';
import { useRallyStore } from '@/lib/store';
import { normalizeAnswer } from '@/lib/utils';

const AnimatedPressable = createAnimatedComponent(Pressable);

export default function LandmarkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const landmark = useMemo(() => LANDMARKS.find((l) => l.id === id), [id]);

  const progress = useRallyStore((s) => (id ? s.progress[id] : undefined));
  const stampLandmark = useRallyStore((s) => s.stampLandmark);
  const answerTrivia = useRallyStore((s) => s.answerTrivia);

  const [accent, success, muted] = useThemeColor(['accent', 'success', 'muted']);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const scale = useSharedValue(1);
  const animatedStampStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  if (!landmark) {
    return (
      <View className="bg-background flex-1 items-center justify-center p-6">
        <Text className="text-muted text-base">Landmark not found.</Text>
      </View>
    );
  }

  const stamped = progress?.stamped ?? false;
  const triviaCorrect = progress?.triviaCorrect ?? false;

  const handleStamp = () => {
    if (stamped) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    scale.value = withSequence(
      withTiming(0.82, { duration: 120 }),
      withSpring(1.08, { damping: 6 }),
      withSpring(1, { damping: 10 }),
    );
    stampLandmark(landmark.id);
  };

  const handleAnswer = () => {
    setSubmitted(true);
    const ok = landmark.trivia.answers.includes(normalizeAnswer(answer));
    if (ok && !triviaCorrect) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      answerTrivia(landmark.id, landmark.trivia.points);
    } else if (!ok) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const isCorrect = triviaCorrect || landmark.trivia.answers.includes(normalizeAnswer(answer));
  const showWrong = submitted && !isCorrect;

  return (
    <KeyboardAvoidingView
      className="bg-background flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={{ title: landmark.shortName }} />
      <ScrollView
        contentContainerClassName="px-5 pb-12 pt-4"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* TOP: Stamp centerpiece */}
        <View className="items-center">
          <AnimatedPressable
            onPress={handleStamp}
            disabled={stamped}
            style={animatedStampStyle}
            className="items-center justify-center"
          >
            <StampImage stamped={stamped} size={220} />
          </AnimatedPressable>
          {stamped ? (
            <Animated.View entering={FadeIn} className="mt-1 flex-row items-center gap-1.5">
              <CheckCircle2 size={16} color={success} />
              <Text className="text-sm font-semibold" style={{ color: success }}>
                Checked in
              </Text>
            </Animated.View>
          ) : (
            <Text className="mt-1 text-sm font-medium" style={{ color: accent }}>
              Tap the stamp to check in
            </Text>
          )}
        </View>

        {/* Title */}
        <View className="mt-6">
          <Text className="text-foreground text-2xl font-bold">{landmark.name}</Text>
          <Text className="text-muted mt-1 text-base">{landmark.tagline}</Text>
          <Text className="text-foreground mt-3 text-sm leading-5">{landmark.description}</Text>
        </View>

        {/* MIDDLE: Upfront trivia hook */}
        <Surface variant="secondary" className="mt-6 rounded-2xl p-4">
          <View className="flex-row items-center gap-2">
            <HelpCircle size={18} color={accent} />
            <Text className="text-sm font-semibold" style={{ color: accent }}>
              Trivia hook · {landmark.trivia.points} pts
            </Text>
          </View>
          <Text className="text-foreground mt-2 text-base font-medium">
            {landmark.trivia.question}
          </Text>
          <Text className="text-muted mt-2 text-xs">
            Go to the spot to find the answer, then check in below.
          </Text>
        </Surface>

        {/* BOTTOM: Answer input (active after check-in) */}
        <View className="mt-6">
          <Text className="text-foreground mb-3 text-lg font-semibold">Your answer</Text>

          {!stamped && (
            <Surface
              variant="secondary"
              className="mb-3 flex-row items-center gap-2 rounded-2xl p-3"
            >
              <Lock size={16} color={muted} />
              <Text className="text-muted flex-1 text-sm">
                Check in by tapping the stamp above to unlock the answer.
              </Text>
            </Surface>
          )}

          {triviaCorrect ? (
            <Surface variant="secondary" className="rounded-2xl p-4">
              <View className="flex-row items-center gap-2">
                <Sparkles size={18} color={success} />
                <Text className="text-base font-semibold" style={{ color: success }}>
                  Correct! +{landmark.trivia.points} trivia points
                </Text>
              </View>
              <View className="mt-3 flex-row items-start gap-2">
                <Lightbulb size={16} color={accent} />
                <Text className="text-foreground flex-1 text-sm">{landmark.trivia.funFact}</Text>
              </View>
            </Surface>
          ) : (
            <View className="gap-3">
              <TextField isInvalid={showWrong} isDisabled={!stamped}>
                <Label>Answer the trivia</Label>
                <Input
                  placeholder="Type your answer"
                  value={answer}
                  onChangeText={(t) => {
                    setAnswer(t);
                    setSubmitted(false);
                  }}
                  autoCapitalize="none"
                  editable={stamped}
                  onSubmitEditing={handleAnswer}
                  returnKeyType="done"
                />
                {showWrong ? (
                  <FieldError>Not quite — take another look and try again.</FieldError>
                ) : (
                  <Description>Hint: {landmark.trivia.question}</Description>
                )}
              </TextField>
              <Button
                variant="primary"
                size="lg"
                isDisabled={!stamped || answer.trim().length === 0}
                onPress={handleAnswer}
              >
                <Button.Label>Submit answer</Button.Label>
              </Button>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
