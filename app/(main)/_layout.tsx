import { Stack } from 'expo-router';
import { DrawerProvider } from '@/components/common/drawer-context';
import { AppDrawer } from '@/components/common/app-drawer';

export default function MainLayout() {
  return (
    <DrawerProvider>
      <AppDrawer>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        />
      </AppDrawer>
    </DrawerProvider>
  );
}
