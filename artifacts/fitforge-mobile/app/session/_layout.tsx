import { Stack } from 'expo-router';

export default function SessionLayout() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen
        name="[dayId]"
        options={{
          title: 'Workout',
          headerBackTitle: 'Back',
        }}
      />
    </Stack>
  );
}
