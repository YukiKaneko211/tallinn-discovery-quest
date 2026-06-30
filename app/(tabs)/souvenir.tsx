import { useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import { Button, Surface, Text, useThemeColor } from 'heroui-native';
import { Camera, ImagePlus, Lock, Sparkles } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';

import { FrameOverlay } from '@/components/FrameOverlay';
import { FRAMES } from '@/lib/data';
import { isFrameUnlocked, stampCount, useRallyStore } from '@/lib/store';
import type { PhotoFrame } from '@/lib/types';

const PHOTO_SIZE = 320;

function unlockLabel(frame: PhotoFrame): string {
  if (frame.unlock.type === 'stamps') {
    return `${frame.unlock.threshold} stamp${frame.unlock.threshold === 1 ? '' : 's'}`;
  }
  return `${frame.unlock.threshold} pts`;
}

export default function SouvenirScreen() {
  const progress = useRallyStore((s) => s.progress);
  const triviaPoints = useRallyStore((s) => s.triviaPoints);
  const selectedFrameId = useRallyStore((s) => s.selectedFrameId);
  const selectFrame = useRallyStore((s) => s.selectFrame);

  const [accent, muted, gold] = useThemeColor(['accent', 'muted', 'warning']);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const stamps = stampCount(progress);

  const selectedFrame = useMemo(
    () => FRAMES.find((f) => f.id === selectedFrameId) ?? FRAMES[0],
    [selectedFrameId],
  );

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      // Fall back to library if camera access is unavailable (e.g. web).
      await pickFromLibrary();
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSelectFrame = (frame: PhotoFrame, unlocked: boolean) => {
    if (!unlocked) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    void Haptics.selectionAsync();
    selectFrame(frame.id);
  };

  return (
    <ScrollView
      className="bg-background flex-1"
      contentContainerClassName="pb-10 px-5 pt-4"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-foreground text-2xl font-bold">Souvenir Frame</Text>
      <Text className="text-muted mt-1 text-base">
        Frame your photo with a Tallinn-themed border. Unlock more as you explore.
      </Text>

      {/* Preview */}
      <View className="mt-5 items-center">
        <Surface
          variant="secondary"
          className="items-center justify-center overflow-hidden rounded-2xl"
          style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
        >
          {photoUri ? (
            <Image
              source={{ uri: photoUri }}
              style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
              resizeMode="cover"
            />
          ) : (
            <View className="items-center gap-2 px-8">
              <ImagePlus size={40} color={muted} />
              <Text className="text-muted text-center text-sm">
                Add a photo to preview your souvenir frame
              </Text>
            </View>
          )}
          <FrameOverlay frame={selectedFrame} size={PHOTO_SIZE} />
        </Surface>
      </View>

      {/* Photo actions */}
      <View className="mt-4 flex-row gap-3">
        <Button variant="primary" className="flex-1" onPress={() => void takePhoto()}>
          <Camera size={18} color="#FFFFFF" />
          <Button.Label>Take photo</Button.Label>
        </Button>
        <Button variant="secondary" className="flex-1" onPress={() => void pickFromLibrary()}>
          <ImagePlus size={18} color={accent} />
          <Button.Label>Upload</Button.Label>
        </Button>
      </View>

      {/* Frame picker */}
      <Text className="text-foreground mt-7 mb-3 text-lg font-semibold">Choose a frame</Text>
      <View className="gap-3">
        {FRAMES.map((frame) => {
          const unlocked = isFrameUnlocked(frame, stamps, triviaPoints);
          const active = frame.id === selectedFrameId;
          return (
            <Pressable key={frame.id} onPress={() => handleSelectFrame(frame, unlocked)}>
              <Surface
                variant={active ? 'default' : 'secondary'}
                className="flex-row items-center gap-3 rounded-2xl p-3"
                style={active ? { borderWidth: 2, borderColor: accent } : undefined}
              >
                {/* Swatch */}
                <View
                  className="h-12 w-12 items-center justify-center rounded-xl"
                  style={{ backgroundColor: frame.color + '22', opacity: unlocked ? 1 : 0.5 }}
                >
                  {unlocked ? (
                    <View
                      className="h-7 w-7 rounded-md"
                      style={{ borderWidth: 3, borderColor: frame.color }}
                    />
                  ) : (
                    <Lock size={18} color={muted} />
                  )}
                </View>

                <View className="flex-1">
                  <Text className="text-foreground text-base font-semibold">{frame.name}</Text>
                  <Text className="text-muted text-xs" numberOfLines={2}>
                    {frame.description}
                  </Text>
                </View>

                {unlocked ? (
                  active ? (
                    <View className="flex-row items-center gap-1">
                      <Sparkles size={16} color={accent} />
                      <Text className="text-xs font-semibold" style={{ color: accent }}>
                        Selected
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-muted text-xs font-medium">Tap to use</Text>
                  )
                ) : (
                  <View className="items-end">
                    <Text className="text-xs font-semibold" style={{ color: gold }}>
                      Locked
                    </Text>
                    <Text className="text-muted text-[11px]">{unlockLabel(frame)}</Text>
                  </View>
                )}
              </Surface>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
